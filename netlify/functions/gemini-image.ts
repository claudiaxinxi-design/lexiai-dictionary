import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    const prompt = `A simple, pop-art style illustration representing "${term}" in ${targetLang}. White background.`;

    const response = await model.generateContent(prompt);
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const p of parts) {
      if (p.inlineData) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            image: `data:image/png;base64,${p.inlineData.data}`,
          }),
        };
      }
    }

    return { statusCode: 200, body: JSON.stringify({ image: null }) };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};