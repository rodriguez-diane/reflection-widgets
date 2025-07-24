const cohere = require('cohere-ai'); // Use Cohere SDK
cohere.init(process.env.COHERE_API_KEY); // Use your Cohere API key securely from Vercel environment variables

async function generateSynthesis(cogData, reflectionData) {
  try {
    const response = await cohere.generate({
      model: 'xlarge', // You can use other models like 'medium' if needed
      prompt: `Synthesize the following insights:\nCog: ${cogData}\nReflection: ${reflectionData}\n\nSummary:`,
      max_tokens: 100,
    });
    return response.body.generations[0].text.trim();
  } catch (error) {
    console.error("Cohere API error:", error);
    // Fallback logic
    return fallbackSynthesis(cogData, reflectionData);
  }
}

function fallbackSynthesis(cogData, reflectionData) {
  // Basic fallback logic (simple text analysis)
  const cogWords = cogData.split(" ");
  const reflectionWords = reflectionData.split(" ");
  const commonWords = cogWords.filter(word => reflectionWords.includes(word));
  return `Struggles involved: ${commonWords.join(", ")}. Reflections: Focus on these areas.`;
}

module.exports = generateSynthesis;
