import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // ❗ 使用官方支持图片生成的模型
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    const prompt = `
      Create a simple, cute, minimal pop-art illustration representing the word "${term}" in ${targetLang}.
      White background. No text.
    `;

    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"], // 必须指定 image 输出
      },
    });

    const imageData =
      result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        image: imageData ? `data:image/png;base64,${imageData}` : null,
      }),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};