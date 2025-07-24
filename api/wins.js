const cohere = require('cohere-ai'); // Install Cohere SDK
cohere.init(process.env.COHERE_API_KEY); // Use your API key securely from Vercel environment variables

async function getRandomWin(winsArray) {
  try {
    const randomWin = winsArray[Math.floor(Math.random() * winsArray.length)];
    const response = await cohere.generate({
      model: 'xlarge', // You can use other models like 'medium' if needed
      prompt: `Generate a positive, inspiring quote based on: ${randomWin}`,
      max_tokens: 60,
    });
    return response.body.generations[0].text.trim();
  } catch (error) {
    console.error("Cohere API error:", error);
    // Fallback logic
    return fallbackRandomWin(winsArray);
  }
}

function fallbackRandomWin(winsArray) {
  // Simple fallback: Return a random win without AI generation
  return winsArray[Math.floor(Math.random() * winsArray.length)];
}

module.exports = getRandomWin;
