import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    // Retrieve the base64-encoded API key from the environment variable
    const apiKeyBase64 = process.env.GEMINI_API_KEY;
    if (!apiKeyBase64) throw new Error("Missing GEMINI_API_KEY environment variable");

    // Decode the base64 key and parse it
    const decodedKey = Buffer.from(apiKeyBase64, "base64").toString("utf-8");
    
    const genAI = new GoogleGenerativeAI({ api_key: decodedKey });

    // Define the prompt for Gemini
    const prompt = "Summarize and synthesize reflection data from Notion..."; // Replace with actual prompt

    // Generate content with Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Return the generated content
    res.status(200).json({ synthesis: text });
  } catch (error) {
    console.error("Synthesis API error:", error);
    res.status(500).json({ error: error.message });
  }
}
