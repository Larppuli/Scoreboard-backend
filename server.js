import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('games').select('*');
      if (error) {
        return res.status(500).json({ error: 'Error fetching data' });
      }
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else if (req.method === 'POST') {
    const { date, winner, participants, sport } = req.body;
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([{ date, winner, participants, sport }]);

      if (error) {
        return res.status(500).json({ error: 'Error adding game' });
      }
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Error adding game' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
