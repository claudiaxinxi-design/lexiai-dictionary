import { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler: Handler = async (event) => {
  try {
    const { term, type, nativeLang, targetLang } = JSON.parse(event.body || "{}");

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let instruction = "";

    if (type === "natural") {
      instruction = `Explain how to use "${term}" naturally with short examples.`;
    } else if (type === "mistake") {
      instruction = `Explain common mistakes using "${term}" and how to avoid them.`;
    } else if (type === "funfact") {
      instruction = `Give a fun mnemonic or etymology for "${term}".`;
    }

    const prompt = `
      You are a fun ${targetLang} tutor teaching a ${nativeLang} speaker.
      Reply casually in 1–4 sentences with emojis.
      
      Task: ${instruction}
    `;

    const result = await model.generateContent(prompt);

    return {
      statusCode: 200,
      body: JSON.stringify({ answer: result.response.text() }),
    };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};