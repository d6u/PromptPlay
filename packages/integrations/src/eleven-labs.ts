const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";

export async function textToSpeech({
  text,
  voiceId,
  apiKey,
}: {
  text: string;
  voiceId: string;
  apiKey: string;
}): Promise<TextToSpeechSuccessResult | TextToSpeechErrorResult> {
  const fetchOptions = {
    headers: {
      Accept: "audio/mpeg",
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      text: text,
    }),
  };

  const response = await fetch(
    `${ELEVEN_LABS_API_URL}/${voiceId}`,
    fetchOptions
  );

  if (response.ok) {
    return {
      isError: false,
      data: await response.blob(),
    };
  }

  return {
    isError: true,
    data: await response.text(),
  };
}

type TextToSpeechSuccessResult = {
  isError: false;
  data: Blob;
};

type TextToSpeechErrorResult = {
  isError: true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};
