import { createClient } from '@supabase/supabase-js';
import Cors from 'cors';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const cors = Cors({
  methods: ['GET', 'POST'],
  origin: ['https://leaderboard-nu-ebon.vercel.app', 'http://localhost:3000'],
  credentials: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('games').select('*');
      if (error) {
        return res.status(500).json({ error: 'Error fetching data', details: error.message });
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error fetching data', details: err.message });
    }
  } else if (req.method === 'POST') {
    const { date, winner, participants, sport } = req.body;
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{ date, winner, participants, sport }]);

      if (error) {
        return res.status(500).json({ error: 'Error adding game', details: error.message });
      }
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error adding game', details: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
