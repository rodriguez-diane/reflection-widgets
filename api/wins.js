// /api/wins.js
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET supported' });

  try {
    const databaseId = process.env.DATABASE_ID;
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

    res.status(200).json({ wins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch wins from Notion' });
  }
}
