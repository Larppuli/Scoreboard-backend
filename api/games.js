import { createClient } from '@supabase/supabase-js';
import Cors from 'cors';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const cors = Cors({
  methods: ['GET', 'POST', 'DELETE'],
  origin: [process.env.ORIGIN_VERCEL_URL, process.env.ORIGIN_LOCAL_URL],
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
    const { id } = req.query; // Extract the `id` from the query string
    if (id) {
      try {
        // Fetch the game with the given id from the 'games' table
        const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
        if (error) {
          return res.status(500).json({ error: 'Error fetching data', details: error.message });
        }
        if (!data) {
          return res.status(404).json({ error: 'Game not found' });
        }
        res.status(200).json(data); // Return the game data
      } catch (err) {
        res.status(500).json({ error: 'Unexpected error fetching data', details: err.message });
      }
    } else {
      // If no id is provided, return all games
      try {
        const { data, error } = await supabase.from('games').select('*');
        if (error) {
          return res.status(500).json({ error: 'Error fetching data', details: error.message });
        }
        res.status(200).json(data); // Return all games
      } catch (err) {
        res.status(500).json({ error: 'Unexpected error fetching data', details: err.message });
      }
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
  } else if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }
    try {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) {
        return res.status(500).json({ error: 'Error deleting game', details: error.message });
      }
      res.status(200).json({ message: `Game with ID ${id} deleted successfully` });
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error deleting game', details: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
