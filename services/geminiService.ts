// FRONTEND SERVICE: Calls Netlify backend instead of Gemini API directly.

const callBackend = async (endpoint: string, payload: any) => {
  const response = await fetch(`/.netlify/functions/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Backend function error");
  }

  return await response.json();
};

// 1. Get Definition
export const getDefinition = async (
  term: string,
  nativeLang: string,
  targetLang: string
) => {
  return await callBackend("gemini-definition", {
    term,
    nativeLang,
    targetLang,
  });
};

// 2. Generate Image
export const generateImage = async (term: string, targetLang: string) => {
  return await callBackend("gemini-image", {
    term,
    targetLang,
  });
};

// 3. Generate Speech
export const generateSpeech = async (text: string) => {
  return await callBackend("gemini-tts", { text });
};

// 4. Generate Story
export const generateStory = async (
  words: string[],
  nativeLang: string,
  targetLang: string
) => {
  return await callBackend("gemini-story", {
    words,
    nativeLang,
    targetLang,
  });
};

// 5. Quick Answer
export const getQuickAiAnswer = async (
  term: string,
  type: string,
  nativeLang: string,
  targetLang: string
) => {
  return await callBackend("gemini-quick", {
    term,
    type,
    nativeLang,
    targetLang,
  });
};