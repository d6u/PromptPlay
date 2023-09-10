import {
  Observable,
  ReadableStreamLike,
  map,
  mergeMap,
  tap,
  throwError,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";

export const NEW_LINE_SYMBOL = "↵";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

type GetCompletionArguments = {
  apiKey: string;
  model: string;
  temperature: number;
  messages: ChatGPTMessage[];
  stop: string[];
};

export function getStreamingCompletion({
  apiKey,
  model,
  temperature,
  messages,
  stop,
}: GetCompletionArguments): Observable<
  ChatCompletionStreamResponse | ChatCompletionErrorResponse
> {
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stop,
      stream: true,
    }),
  };

  console.log("fetchOptions", fetchOptions);

  return fromFetch(OPENAI_API_URL, {
    ...fetchOptions,
    selector: (response) => {
      if (response.body == null) {
        return throwError(() => new Error("response body is null"));
      }

      return response.body?.pipeThrough(
        new TextDecoderStream()
      ) as ReadableStreamLike<string>;
    },
  }).pipe(
    tap((chunk) => console.log("response", chunk)),
    mergeMap((chunk) => parserStreamChunk(chunk)),
    map<string, ChatCompletionStreamResponse | ChatCompletionErrorResponse>(
      (content) => JSON.parse(content)
    )
  );
}

export async function getNonStreamingCompletion({
  apiKey,
  model,
  temperature,
  messages,
  stop,
}: GetCompletionArguments): Promise<
  | { isError: false; data: ChatCompletionResponse }
  | { isError: true; data: ChatCompletionErrorResponse }
> {
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stop,
    }),
  };

  const response = await fetch(OPENAI_API_URL, fetchOptions);
  const data = await response.json();

  if (response.ok) {
    return { isError: false, data };
  }

  return { isError: true, data };
}

// Stream

export type ChatCompletionStreamResponse = ChatCompletionResponseCommon & {
  choices: Array<ChoiceStream>;
};

type ChoiceStream = ChoiceCommon & {
  delta: {
    role?: string;
    content?: string;
  };
  finish_reason: string | null;
  index: number;
};

// Non-stream

export type ChatCompletionResponse = ChatCompletionResponseCommon & {
  choices: Array<Choice>;
  usage: {
    prompt_token: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

type Choice = ChoiceCommon & {
  message: ChatGPTMessage;
};

// Error

export type ChatCompletionErrorResponse = {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: number | null;
  };
};

// Common

export type ChatGPTMessage = {
  role: string;
  content: string;
};

export enum ChatGPTMessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
}

type ChoiceCommon = {
  finish_reason: string;
  index: number;
};

type ChatCompletionResponseCommon = {
  created: number;
  id: string;
  model: string;
  object: string;
};

// Utils

function parserStreamChunk(chunk: string): string[] {
  if (!chunk.startsWith("data:")) {
    return [chunk];
  }

  return chunk
    .split("\n")
    .map((line) => line.replace("data:", "").trim())
    .filter((line) => line && !line.includes("[DONE]"));
}
