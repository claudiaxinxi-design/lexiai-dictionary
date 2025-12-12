import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, type, nativeLang, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build correct instruction
    let instruction = "";
    if (type === "natural") {
      instruction = `Explain how to use "${term}" naturally with 1–2 casual example sentences.`;
    } else if (type === "mistake") {
      instruction = `Explain the most common mistakes when using "${term}" and how a learner can avoid them.`;
    } else if (type === "funfact") {
      instruction = `Give a fun etymology or mnemonic to remember "${term}".`;
    }

    // Final prompt
    const prompt = `
      You are a friendly ${targetLang} tutor teaching a ${nativeLang} speaker.
      Respond in a casual tone, max 4 sentences, include emojis.
      Task: ${instruction}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const answerText = result.response.text().trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: answerText }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};