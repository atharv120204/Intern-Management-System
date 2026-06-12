const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/intern/:internId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM feedback WHERE intern_id = ? ORDER BY feedback_date DESC',
      [req.params.internId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { intern_id, submitted_by, feedback_date, category, message, is_private } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO feedback (intern_id, submitted_by, feedback_date, category, message, is_private) VALUES (?, ?, ?, ?, ?, ?)',
      [intern_id, submitted_by, feedback_date, category, message, is_private || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM feedback WHERE id = ?', [req.params.id]);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
