// /api/index.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ message: "API is live! Add logic for /wins and /synthesis here." });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
