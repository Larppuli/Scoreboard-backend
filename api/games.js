import { createClient } from '@supabase/supabase-js';
import Cors from 'cors';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const cors = Cors({
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
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

  const host = req.headers.host || '';
  const tableName = (host.includes('demo')) ? 'games_demo' : 'games';

  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      try {
        const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
        if (error) {
          return res.status(500).json({ error: 'Error fetching data', details: error.message });
        }
        if (!data) {
          return res.status(404).json({ error: 'Game not found' });
        }
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ error: 'Unexpected error fetching data', details: err.message });
      }
    } else {
      try {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) {
          return res.status(500).json({ error: 'Error fetching data', details: error.message });
        }
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ error: 'Unexpected error fetching data', details: err.message });
      }
    }
  } else if (req.method === 'POST') {
    const { date, winner, participants, sport } = req.body;
    try {
      const { data, error } = await supabase
        .from(tableName)
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
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        return res.status(500).json({ error: 'Error deleting game', details: error.message });
      }
      res.status(200).json({ message: `Game with ID ${id} deleted successfully` });
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error deleting game', details: err.message });
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query;
    const { date, winner, participants, sport } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    try {
      const { data, error } = await supabase
        .from(tableName)
        .update({ date, winner, participants, sport })
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: 'Error updating game', details: error.message });
      }

      res.status(200).json({ message: `Game with ID ${id} updated successfully`, data });
    } catch (err) {
      res.status(500).json({ error: 'Unexpected error updating game', details: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
