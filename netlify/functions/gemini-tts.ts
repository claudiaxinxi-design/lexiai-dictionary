import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI, Modality } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-tts",
    });

    const result = await model.generateContent({
      contents: [{ parts: [{ text }] }],
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
      },
    });

    const audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return { statusCode: 200, body: JSON.stringify({ audio }) };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};