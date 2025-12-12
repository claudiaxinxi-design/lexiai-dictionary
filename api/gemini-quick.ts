export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { term, type, nativeLang, targetLang } = await req.json();

    if (!term) {
      return new Response(JSON.stringify({ error: "Missing term" }), {
        status: 400,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
        status: 500,
      });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      apiKey;

    // Fallback instruction 让 type 丢失也能正常运作
    let instruction = "Explain this word in a simple and helpful way.";

    if (type === "natural") {
      instruction = `Explain how to use "${term}" naturally in ${targetLang}. Include 1–2 short examples.`;
    } else if (type === "mistake") {
      instruction = `Explain common mistakes learners make when using "${term}" in ${targetLang}.`;
    } else if (type === "funfact") {
      instruction = `Give a fun mnemonic, origin, or memory trick for "${term}".`;
    }

    const prompt = `
      You are a friendly ${targetLang} tutor teaching a ${nativeLang} learner.

      Task: ${instruction}

      Requirements:
      - Reply in ONLY 1–3 short sentences.
      - Use a casual tone.
      - Include at least one emoji.
      - Do NOT use markdown.
      - Output plain text only.
    `;

    const geminiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await geminiRes.json();

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "No response generated.";

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}