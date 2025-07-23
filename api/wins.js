// /api/wins.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "@notionhq/client";

export default async function handler(req, res) {
  try {
    // Decode Gemini service account key
    const keyBase64 = process.env.GEMIN_KEY_BASE64;
    if (!keyBase64) throw new Error("Missing GEMIN_KEY_BASE64");

    const keyJson = Buffer.from(keyBase64, "base64").toString("utf-8");
    const credentials = JSON.parse(keyJson);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(credentials.api_key);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Initialize Notion
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const databaseId = process.env.DATABASE_ID;

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Win",
        rich_text: {
          is_not_empty: true,
        },
      },
    });

    const wins = response.results.map((page) => {
      const winProp = page.properties["Win"];
      return winProp?.rich_text?.[0]?.plain_text || null;
    }).filter(Boolean);

    if (wins.length === 0) {
      return res.status(200).json({ wins: [] });
    }

    // Ask Gemini to make wins more exciting or summarized if you want
    const prompt = `Here are some wins: \n\n${wins.join("\n")}\n\nFormat as a motivational list:`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ wins: text });
  } catch (error) {
    console.error("Wins API error:", error);
    res.status(500).json({ error: error.message });
  }
}
