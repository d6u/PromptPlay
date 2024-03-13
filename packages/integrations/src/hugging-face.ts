const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models";

function getUrlForModel(model: string) {
  return `${HUGGING_FACE_API_URL}/${model}`;
}

type Options = {
  apiToken: string;
  model: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Parameters = any;

export async function callInferenceApi(
  options: Options,
  parameters: Parameters
): Promise<HuggingFaceSuccessResult | HuggingFaceErrorResult> {
  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${options.apiToken}`,
    },
    method: "POST",
    body: JSON.stringify(parameters),
  };

  const response = await fetch(getUrlForModel(options.model), fetchOptions);

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

type HuggingFaceSuccessResult = {
  isError: false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

type HuggingFaceErrorResult = {
  isError: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};
