import GoogleGenerativeAI from "@google/generative-ai";
import type { Type } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, nativeLang, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.STRING },
                native: { type: Type.STRING },
              },
            },
          },
          usageNote: { type: Type.STRING },
        },
      },
      responseMimeType: "application/json",
    });

    const prompt = `
      Define "${term}" in ${targetLang} for a ${nativeLang} speaker.
      Include:
      1) Native language definition
      2) Two example sentences (target + native)
      3) A short usage note (fun, casual tone)
    `;

    const result = await model.generateContent(prompt);

    return {
      statusCode: 200,
      body: result.response.text(),
    };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};