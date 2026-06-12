const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all interns
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*,
        ROUND(AVG(pr.overall_score), 2) AS avg_score,
        COUNT(DISTINCT pr.id) AS review_count,
        COUNT(DISTINCT f.id) AS feedback_count
      FROM interns i
      LEFT JOIN performance_reviews pr ON i.id = pr.intern_id
      LEFT JOIN feedback f ON i.id = f.intern_id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single intern with full details
router.get('/:id', async (req, res) => {
  try {
    const [[intern]] = await db.query('SELECT * FROM interns WHERE id = ?', [req.params.id]);
    if (!intern) return res.status(404).json({ error: 'Intern not found' });

    const [reviews] = await db.query(
      'SELECT * FROM performance_reviews WHERE intern_id = ? ORDER BY review_date DESC',
      [req.params.id]
    );
    const [feedbackList] = await db.query(
      'SELECT * FROM feedback WHERE intern_id = ? ORDER BY feedback_date DESC',
      [req.params.id]
    );
    const [recommendations] = await db.query(
      'SELECT * FROM recommendations WHERE intern_id = ? ORDER BY recommendation_date DESC',
      [req.params.id]
    );

    res.json({ ...intern, reviews, feedback: feedbackList, recommendations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create intern
router.post('/', async (req, res) => {
  const { first_name, last_name, email, phone, department, start_date, end_date, university, major, supervisor } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO interns (first_name, last_name, email, phone, department, start_date, end_date, university, major, supervisor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, department, start_date, end_date, university, major, supervisor]
    );
    res.status(201).json({ id: result.insertId, message: 'Intern created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update intern
router.put('/:id', async (req, res) => {
  const { first_name, last_name, email, phone, department, start_date, end_date, status, university, major, supervisor } = req.body;
  try {
    await db.query(
      'UPDATE interns SET first_name=?, last_name=?, email=?, phone=?, department=?, start_date=?, end_date=?, status=?, university=?, major=?, supervisor=? WHERE id=?',
      [first_name, last_name, email, phone, department, start_date, end_date, status, university, major, supervisor, req.params.id]
    );
    res.json({ message: 'Intern updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE intern
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM interns WHERE id = ?', [req.params.id]);
    res.json({ message: 'Intern deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
