const PRIORITY_TIERS = ['Critical', 'High', 'Medium', 'Low'];

const priorityTierToValue = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4
};

const urgencyToPriorityTier = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

function normalizePriorityTier(priority) {
  if (!priority || typeof priority !== 'string') {
    return null;
  }

  const normalized = priority.trim().toLowerCase();
  return PRIORITY_TIERS.find((tier) => tier.toLowerCase() === normalized) || null;
}

function getFallbackPriorityTier(urgencyLevel = 'medium') {
  return urgencyToPriorityTier[urgencyLevel] || urgencyToPriorityTier.medium;
}

function getPriorityValue(priority) {
  const tier = normalizePriorityTier(priority);
  return tier ? priorityTierToValue[tier] : priorityTierToValue.Low;
}

function getPriorityLabel(priority) {
  if (priority === 1) return 'Critical';
  if (priority === 2) return 'High';
  if (priority === 3) return 'Medium';
  if (priority === 4) return 'Low';
  return 'Medium';
}

module.exports = {
  PRIORITY_TIERS,
  getFallbackPriorityTier,
  getPriorityLabel,
  getPriorityValue,
  normalizePriorityTier
};
