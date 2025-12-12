// services/geminiService.ts
// 前端：只负责调用 Vercel API，不直接碰 Gemini SDK

const callBackend = async (endpoint: string, payload: any) => {
  const response = await fetch(`/api/${endpoint}`, {
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
  const res = await callBackend("gemini-image", { term, targetLang });
  return res.image ?? null;
};

// 3. Generate Speech
export const generateSpeech = async (text: string) => {
  const res = await callBackend("gemini-tts", { text });
  return res.audio ?? null;
};

// 4. Generate Story
export const generateStory = async (
  words: string[],
  nativeLang: string,
  targetLang: string
) => {
  const res = await callBackend("gemini-story", {
    words,
    nativeLang,
    targetLang,
  });
  return res.story ?? "";
};

// 5. Quick Answer
export const getQuickAiAnswer = async (
  term: string,
  type: string,
  nativeLang: string,
  targetLang: string
) => {
  const res = await callBackend("gemini-quick", {
    term,
    type,
    nativeLang,
    targetLang,
  });
  return res.answer ?? "";
};