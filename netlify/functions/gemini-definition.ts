import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, nativeLang, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      Define the term "${term}" (in ${targetLang}) for a speaker of ${nativeLang}.
      Provide JSON with fields:
      - definition
      - examples (2 objects {target, native})
      - usageNote
    `;

    const result = await model.generateContent(prompt);

    // IMPORTANT: unwrap text result
    const text = result.response.text();

    return {
      statusCode: 200,
      body: text,
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};