// /api/synthesis.js
import { Client } from '@notionhq/client';
import OpenAI from 'openai';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET supported' });

  try {
    const databaseId = process.env.DATABASE_ID;

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: 'Cog',
            rich_text: { is_not_empty: true }
          },
          {
            property: 'Reflection',
            rich_text: { is_not_empty: true }
          }
        ]
      }
    });

    const entries = response.results.map((page) => {
      const cog = page.properties.Cog?.rich_text?.[0]?.plain_text || '';
      const reflection = page.properties.Reflection?.rich_text?.[0]?.plain_text || '';
      return `Cog: ${cog}\nReflection: ${reflection}`;
    });

    const prompt = `
Based on the following weekly reflections, synthesize any patterns in Cogs (struggles) and what was learned (Reflections). Be concise and insightful.

Entries:
${entries.join('\n\n')}
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o'
    });

    const synthesis = completion.choices[0].message.content;
    res.status(200).json({ synthesis });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate synthesis from Notion & OpenAI' });
  }
}
