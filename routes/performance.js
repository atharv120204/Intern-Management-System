const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all reviews for an intern
router.get('/intern/:internId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM performance_reviews WHERE intern_id = ? ORDER BY review_date DESC',
      [req.params.internId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add review
router.post('/', async (req, res) => {
  const { intern_id, reviewer_name, review_date, technical_skills, communication, teamwork, initiative, punctuality, notes } = req.body;
  const overall_score = ((+technical_skills + +communication + +teamwork + +initiative + +punctuality) / 5).toFixed(2);
  try {
    const [result] = await db.query(
      'INSERT INTO performance_reviews (intern_id, reviewer_name, review_date, technical_skills, communication, teamwork, initiative, punctuality, overall_score, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [intern_id, reviewer_name, review_date, technical_skills, communication, teamwork, initiative, punctuality, overall_score, notes]
    );
    res.status(201).json({ id: result.insertId, overall_score, message: 'Review added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE review
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM performance_reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
