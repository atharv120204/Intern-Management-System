const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/stats', async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM interns');
    const [[{ active }]] = await db.query("SELECT COUNT(*) AS active FROM interns WHERE status='active'");
    const [[{ avg_score }]] = await db.query('SELECT ROUND(AVG(overall_score),2) AS avg_score FROM performance_reviews');
    const [[{ total_feedback }]] = await db.query('SELECT COUNT(*) AS total_feedback FROM feedback');
    const [[{ full_time_recs }]] = await db.query("SELECT COUNT(*) AS full_time_recs FROM recommendations WHERE recommendation_type='full_time'");

    const [by_department] = await db.query(`
      SELECT department, COUNT(*) AS count,
        ROUND(AVG(pr.overall_score),2) AS avg_score
      FROM interns i
      LEFT JOIN performance_reviews pr ON i.id = pr.intern_id
      GROUP BY department
    `);

    const [recent_interns] = await db.query(`
      SELECT i.id, i.first_name, i.last_name, i.department, i.status,
        ROUND(AVG(pr.overall_score),2) AS avg_score
      FROM interns i
      LEFT JOIN performance_reviews pr ON i.id = pr.intern_id
      GROUP BY i.id
      ORDER BY i.created_at DESC LIMIT 5
    `);

    const [top_performers] = await db.query(`
      SELECT i.id, i.first_name, i.last_name, i.department,
        ROUND(AVG(pr.overall_score),2) AS avg_score
      FROM interns i
      JOIN performance_reviews pr ON i.id = pr.intern_id
      GROUP BY i.id
      HAVING avg_score IS NOT NULL
      ORDER BY avg_score DESC LIMIT 5
    `);

    res.json({ total, active, avg_score, total_feedback, full_time_recs, by_department, recent_interns, top_performers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
