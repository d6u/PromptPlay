const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export type LlmMesssage = {
  role: string;
  content: string;
};

type GetCompletionArguments = {
  apiKey: string;
  model: string;
  temperature: number;
  messages: LlmMesssage[];
  stop: string[];
};

export function getCompletion({
  apiKey,
  model,
  temperature,
  messages,
  stop,
}: GetCompletionArguments): Promise<Response> {
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

  return fetch(OPENAI_API_URL, fetchOptions);
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
  message: LlmMesssage;
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

export type OpenAiStreamErrorResponse = {
  error: {
    code: number | null;
    message: string;
    param: string | null;
    type: string;
  };
};

export function parserStreamChunk(chunk: string): string[] {
  if (!chunk.startsWith("data:")) {
    return [chunk];
  }

  return chunk
    .split("\n")
    .map((line) => line.replace("data:", "").trim())
    .filter((line) => line && !line.includes("[DONE]"));
}
