// api/gemini-story.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { words, nativeLang, targetLang } = req.body || {};

    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: "Missing words array" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const prompt = `
      Create a short, simple, fun story in ${targetLang}.
      You MUST use ALL these words naturally:
      ${words.join(", ")}

      Constraints:
      - 3–5 sentences
      - Make it easy for a ${nativeLang} learner
      - Output ONLY the story text. No explanation.
    `;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API request failed",
        status: response.status,
      });
    }

    const data = await response.json();

    const story =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No story generated.";

    return res.status(200).json({ story });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}