export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { term, nativeLang, targetLang } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
        status: 500,
      });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      apiKey;

    const prompt = `
      You are a JSON API.
      For the term "${term}" in ${targetLang}, and a ${nativeLang} learner,
      reply with ONLY valid JSON in this shape:

      {
        "definition": "string",
        "examples": [
          { "target": "sentence in ${targetLang}", "native": "translation in ${nativeLang}" },
          { "target": "sentence in ${targetLang}", "native": "translation in ${nativeLang}" }
        ],
        "usageNote": "fun and casual usage explanation"
      }

      IMPORTANT:
      - No markdown
      - No backticks
      - No explanations outside JSON
      - Make "target" ALWAYS the ${targetLang} sentence (first line)
    `;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    };

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await geminiRes.json();
    let rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    // 清除 ```json ``` 之类的东西
    rawText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "JSON parse error from Gemini",
          raw: rawText,
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}