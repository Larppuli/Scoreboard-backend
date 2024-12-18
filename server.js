require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.get('/games', async (req, res) => {
    const { data, error } = await supabase
    .from('games')
    .select('*');

  if (error) {
    return res.status(500).send('Error fetching data');
  }

  res.json(data);
});

app.post('/games', async (req, res) => {
  const { date, winner, participants, sport } = req.body;

  const { data, error } = await supabase
    .from('games')
    .insert([
      { date, winner, participants, sport }
    ]);

  if (error) {
    return res.status(500).send('Error adding game');
  }

  res.json(data);
});

app.listen(port, () => {
});
