import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET supported' });

  try {
    // Retrieve the base64-encoded API key from environment variable
    const apiKeyBase64 = process.env.GEMINI_API_KEY;
    if (!apiKeyBase64) throw new Error("Missing GEMINI_API_KEY environment variable");

    // Decode the base64 key and parse it
    const decodedKey = Buffer.from(apiKeyBase64, "base64").toString("utf-8");

    // Initialize Gemini with the decoded API key
    const genAI = new GoogleGenerativeAI({ api_key: decodedKey });

    const databaseId = process.env.DATABASE_ID;

    // Query Notion for the "Wins" entries
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Wins',
        rich_text: {
          is_not_empty: true
        }
      }
    });

    const wins = response.results.map((page) => {
      const winText = page.properties.Wins?.rich_text?.[0]?.plain_text || '';
      return winText;
    });

    // Create the prompt for Gemini
    const prompt = `
      Based on the following wins from my reflection exercises, summarize the key insights and victories:
      ${wins.join('\n')}
    `;

    // Generate content using Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Return the synthesized wins text
    res.status(200).json({ wins: text });

  } catch (error) {
    console.error("Wins API error:", error);
    res.status(500).json({ error: error.message });
  }
}
