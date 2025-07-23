// /api/synthesis.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const keyBase64 = process.env.GEMIN_KEY_BASE64;
    if (!keyBase64) throw new Error("Missing GEMIN_KEY_BASE64 environment variable");

    const keyJson = Buffer.from(keyBase64, "base64").toString("utf-8");
    const credentials = JSON.parse(keyJson);

    const genAI = new GoogleGenerativeAI(credentials.api_key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Replace this with actual Notion data fetching
    const prompt = "Summarize and synthesize reflection data from Notion...";

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ synthesis: text });
  } catch (error) {
    console.error("Synthesis API error:", error);
    res.status(500).json({ error: error.message });
  }
}
