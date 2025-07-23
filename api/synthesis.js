import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    // Read the base64 encoded JSON string from the environment variable
    const keyBase64 = process.env.GEMIN_KEY_BASE64;
    if (!keyBase64) throw new Error("Missing GEMIN_KEY_BASE64 environment variable");

    // Decode the base64 key and parse it
    const keyJson = Buffer.from(keyBase64, "base64").toString("utf-8");
    const credentials = JSON.parse(keyJson);

    // Initialize the Gemini client with the API key from credentials
    const genAI = new GoogleGenerativeAI(credentials.api_key); // Adjust accordingly if necessary

    // Define the prompt
    const prompt = "Summarize and synthesize reflection data from Notion...";

    // Generate the content
    const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent(prompt);
    const text = result.response.text();

    // Return the generated synthesis
    res.status(200).json({ synthesis: text });
  } catch (error) {
    console.error("Synthesis API error:", error);
    res.status(500).json({ error: error.message });
  }
}
