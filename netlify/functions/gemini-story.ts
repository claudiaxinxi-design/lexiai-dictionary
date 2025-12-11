import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { words, nativeLang, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      Create a simple real-life dialogue in ${targetLang} using these words:
      ${words.join(", ")}.

      Requirements:
      - Simple beginner language
      - Max 6–8 lines
      - After each ${targetLang} line, include ${nativeLang} translation in parentheses.
    `;

    const result = await model.generateContent(prompt);

    return {
      statusCode: 200,
      body: JSON.stringify({ story: result.response.text() }),
    };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};