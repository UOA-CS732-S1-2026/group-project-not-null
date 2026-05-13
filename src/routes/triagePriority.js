const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../middleware/auth');
const { analyzePriority } = require('../services/nvidiaPriorityService');
const { getFallbackPriorityTier } = require('../services/priorityUtils');

router.post('/', verifyAuth, async (req, res) => {
  const { description, department, urgencyLevel } = req.body;

  if (!description || !department || !urgencyLevel) {
    return res.status(400).json({
      error: 'Description, department, and urgency level are required'
    });
  }

  try {
    const analysis = await analyzePriority({ description, department, urgencyLevel });
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Priority triage error:', error);
    return res.status(200).json({
      priority: getFallbackPriorityTier(urgencyLevel),
      reason: 'AI triage is unavailable, so priority was based on the selected urgency.',
      fallback: true
    });
  }
});

module.exports = router;
