import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, nativeLang, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // 不使用 responseSchema，因为 Type 不存在，会导致 Netlify 打包失败
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      Define "${term}" in ${targetLang} for a ${nativeLang} speaker.
      Include:
      1) A clear definition
      2) Two example sentences (target + native)
      3) A short, fun usage note
      Return as JSON with keys:
      - definition
      - examples (array of { target, native })
      - usageNote
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