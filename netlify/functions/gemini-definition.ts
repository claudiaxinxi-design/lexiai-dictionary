import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, nativeLang, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are a JSON API.
      For the term "${term}" (in ${targetLang}) and a ${nativeLang} speaker,
      respond ONLY with valid JSON, no backticks, no prose.

      JSON shape:
      {
        "definition": string,
        "examples": [
          { "target": string, "native": string },
          { "target": string, "native": string }
        ],
        "usageNote": string
      }
    `;

    const result = await model.generateContent(prompt);

    let raw = result.response.text().trim();

    // 有些时候 Gemini 会加 ```json ... ```，这里统一清洗掉
    raw = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      // 如果还是解析失败，把原始内容返回，方便调试
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to parse JSON from Gemini",
          raw,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};