export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const { term, targetLang } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), {
        status: 500,
      });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=" +
      apiKey;

    const prompt = `A simple, pop-art style illustration representing "${term}" in ${targetLang}. White background.`;

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

    let base64 = null;
    const parts = data?.candidates?.[0]?.content?.parts ?? [];

    for (const p of parts) {
      if (p.inlineData?.data) {
        base64 = `data:image/png;base64,${p.inlineData.data}`;
        break;
      }
    }

    return new Response(JSON.stringify({ image: base64 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}