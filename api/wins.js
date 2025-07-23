import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET supported' });

  try {
    // Retrieve the base64-encoded JSON string from environment variable
    const keyBase64 = process.env.GEMIN_KEY_BASE64;
    if (!keyBase64) throw new Error("Missing GEMIN_KEY_BASE64 environment variable");

    // Decode and parse the base64 string to JSON
    const keyJson = Buffer.from(keyBase64, "base64").toString("utf-8");
    const credentials = JSON.parse(keyJson);

    // Initialize Gemini API with the decoded credentials
    const genAI = new GoogleGenerativeAI(credentials.api_key); 

    const databaseId = process.env.DATABASE_ID;
    
    // Query the Notion database for the 'Wins' property
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

    // Use the wins data to generate a prompt for Gemini
    const prompt = `
      Based on the following wins from my reflection exercises, summarize the key insights and victories:
      ${wins.join('\n')}
    `;

    // Generate content using Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Send the response back with the generated text
    res.status(200).json({ wins: text });

  } catch (error) {
    console.error("Wins API error:", error);
    res.status(500).json({ error: error.message });
  }
}
