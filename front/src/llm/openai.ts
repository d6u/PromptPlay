import { Observable, from, map, mergeMap, share, throwError } from "rxjs";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export enum ChatGPTMessageRole {
  system = "system",
  user = "user",
  assistant = "assistant",
}

export type ChatGPTMessage = {
  role: string;
  content: string;
};

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
  OpenAiStreamResponse | OpenAiErrorResponse
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

  return from(fetch(OPENAI_API_URL, fetchOptions)).pipe(
    mergeMap((response) => {
      if (response.body == null) {
        // console.error("response.body is null");
        return throwError(() => new Error("response.body is null"));
      }

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .getReader();

      return new Observable<string>((subscriber) => {
        async function read() {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { value, done } = await reader.read();
            if (value) {
              subscriber.next(value);
            }
            if (done) {
              return;
            }
          }
        }

        read()
          .then(() => {
            subscriber.complete();
          })
          .catch((e) => {
            subscriber.error(e);
          });
      });
    }),
    map((chunk) => parserStreamChunk(chunk)),
    mergeMap((chunks) => from(chunks)),
    map<string, OpenAiStreamResponse | OpenAiErrorResponse>((content) =>
      JSON.parse(content)
    ),
    share()
  );
}

export async function getNonStreamingCompletion({
  apiKey,
  model,
  temperature,
  messages,
  stop,
}: GetCompletionArguments): Promise<
  | {
      isError: false;
      data: OpenAiResponse;
    }
  | {
      isError: true;
      data: OpenAiErrorResponse;
    }
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
    return {
      isError: false,
      data,
    };
  }

  return {
    isError: true,
    data,
  };
}

type ChoiceBase = {
  finish_reason: string;
  index: number;
};

type OpenAiResponseBase = {
  created: number;
  id: string;
  model: string;
  object: string;
};

// Non-stream

type Choice = ChoiceBase & {
  message: ChatGPTMessage;
};

export type OpenAiResponse = OpenAiResponseBase & {
  choices: Array<Choice>;
  usage: {
    prompt_token: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

// Stream

type ChoiceStream = ChoiceBase & {
  delta: {
    role?: string;
    content?: string;
  };
  finish_reason: string | null;
  index: number;
};

export type OpenAiStreamResponse = OpenAiResponseBase & {
  choices: Array<ChoiceStream>;
};

// Error

export type OpenAiErrorResponse = {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: number | null;
  };
};

function parserStreamChunk(chunk: string): string[] {
  if (!chunk.startsWith("data:")) {
    return [chunk];
  }

  return chunk
    .split("\n")
    .map((line) => line.replace("data:", "").trim())
    .filter((line) => line && !line.includes("[DONE]"));
}
