const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/intern/:internId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM recommendations WHERE intern_id = ? ORDER BY recommendation_date DESC',
      [req.params.internId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-generate recommendation summary based on performance data
router.get('/generate/:internId', async (req, res) => {
  try {
    const [[intern]] = await db.query('SELECT * FROM interns WHERE id = ?', [req.params.internId]);
    if (!intern) return res.status(404).json({ error: 'Intern not found' });

    const [reviews] = await db.query(
      'SELECT * FROM performance_reviews WHERE intern_id = ?',
      [req.params.internId]
    );
    const [feedbackList] = await db.query(
      "SELECT * FROM feedback WHERE intern_id = ? AND category = 'positive'",
      [req.params.internId]
    );

    if (reviews.length === 0) {
      return res.json({ summary: 'Not enough performance data to generate a recommendation.' });
    }

    const avg = (field) => (reviews.reduce((s, r) => s + r[field], 0) / reviews.length).toFixed(1);
    const overallAvg = parseFloat(avg('overall_score'));

    const strengths = [];
    const improvements = [];

    if (parseFloat(avg('technical_skills')) >= 4) strengths.push('strong technical skills');
    else improvements.push('technical skills');

    if (parseFloat(avg('communication')) >= 4) strengths.push('excellent communication');
    else improvements.push('communication');

    if (parseFloat(avg('teamwork')) >= 4) strengths.push('outstanding teamwork');
    else improvements.push('teamwork');

    if (parseFloat(avg('initiative')) >= 4) strengths.push('high initiative');
    else improvements.push('taking more initiative');

    if (parseFloat(avg('punctuality')) >= 4) strengths.push('great reliability');
    else improvements.push('punctuality');

    let rating, type;
    if (overallAvg >= 4.5) { rating = 'exceptional'; type = 'full_time'; }
    else if (overallAvg >= 4.0) { rating = 'strong'; type = 'full_time'; }
    else if (overallAvg >= 3.0) { rating = 'adequate'; type = 'extend'; }
    else { rating = 'below_expectations'; type = 'decline'; }

    const positiveFeedbackCount = feedbackList.length;
    const summary = `${intern.first_name} ${intern.last_name} has demonstrated ${strengths.join(', ')} during their internship in the ${intern.department} department. ` +
      (positiveFeedbackCount > 0 ? `They received ${positiveFeedbackCount} positive feedback entries. ` : '') +
      (improvements.length > 0 ? `Areas for growth include ${improvements.join(' and ')}. ` : '') +
      `Based on an overall score of ${overallAvg}/5, a ${type.replace('_', ' ')} recommendation is suggested.`;

    res.json({
      intern_name: `${intern.first_name} ${intern.last_name}`,
      overall_avg: overallAvg,
      rating,
      recommendation_type: type,
      strengths: strengths.join(', '),
      areas_for_improvement: improvements.join(', '),
      summary
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { intern_id, recommended_by, recommendation_date, recommendation_type, strengths, areas_for_improvement, summary, rating } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO recommendations (intern_id, recommended_by, recommendation_date, recommendation_type, strengths, areas_for_improvement, summary, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [intern_id, recommended_by, recommendation_date, recommendation_type, strengths, areas_for_improvement, summary, rating]
    );
    res.status(201).json({ id: result.insertId, message: 'Recommendation saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM recommendations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recommendation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
