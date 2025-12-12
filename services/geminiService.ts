// services/geminiService.ts
// 前端：只负责调用 Netlify Functions，不直接碰 Gemini SDK

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

// 1. Get Definition —— 保持原样，返回整个对象 { definition, examples, usageNote }
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

// 2. Generate Image —— 只返回 base64 字符串，不再是整个对象
export const generateImage = async (term: string, targetLang: string) => {
  const res = await callBackend("gemini-image", { term, targetLang });
  return res.image ?? null; // 这样 <img src={image} /> 才会是正确的字符串
};

// 3. Generate Speech (TTS) —— 只返回 audio base64
export const generateSpeech = async (text: string) => {
  const res = await callBackend("gemini-tts", { text });
  return res.audio ?? null;
};

// 4. Generate Story —— 后端返回 { story: "..." }，这里只取 story 字符串
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

// 5. Quick Answer (AI Deep Dive) —— 后端返回 { answer: "..." }
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