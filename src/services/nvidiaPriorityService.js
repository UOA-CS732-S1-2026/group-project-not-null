const axios = require('axios');
const {
  getFallbackPriorityTier,
  normalizePriorityTier
} = require('./priorityUtils');

const NVIDIA_API_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_CHAT_COMPLETIONS_URL = `${NVIDIA_API_BASE_URL}/chat/completions`;
const NVIDIA_MODEL = 'google/gemma-3n-e4b-it';

const SYSTEM_INSTRUCTION = `You are a specialized support triaging agent. Evaluate the ticket and assign a single priority tier.

Critical: System-wide outages or safety issues.
High: Individual blockers preventing work.
Medium: Significant issues with a workaround.
Low: Minor bugs or general inquiries.

Constraint: Return exactly one word from this list: Critical, High, Medium, Low.`;

function buildPrompt({ description, department, urgencyLevel }) {
  return [
    'Assess this student support ticket priority.',
    `Description: ${description}`,
    `Department: ${department}`,
    `Student-Selected Urgency: ${urgencyLevel}`,
    'Return only one priority word: Critical, High, Medium, or Low.'
  ].join('\n');
}

function buildFallbackResult(urgencyLevel, reason) {
  return {
    priority: getFallbackPriorityTier(urgencyLevel),
    reason,
    fallback: true
  };
}

function extractPriority(content) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  const firstPriority = content.match(/\b(Critical|High|Medium|Low)\b/i)?.[1];
  return normalizePriorityTier(firstPriority);
}

async function analyzePriority({ description, department, urgencyLevel }) {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return buildFallbackResult(
      urgencyLevel,
      'AI triage is unavailable, so priority was based on the selected urgency.'
    );
  }

  try {
    const response = await axios.post(
      NVIDIA_CHAT_COMPLETIONS_URL,
      {
        model: NVIDIA_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_INSTRUCTION
          },
          {
            role: 'user',
            content: buildPrompt({ description, department, urgencyLevel })
          }
        ],
        stream: false,
        temperature: 0.2,
        max_tokens: 100
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    const priority = extractPriority(content);

    if (!priority) {
      throw new Error('Nvidia returned an invalid priority');
    }

    return {
      priority,
      reason: 'Priority was assigned by AI triage.',
      fallback: false
    };
  } catch (error) {
    console.error('Nvidia priority analysis error:', {
      status: error.response?.status || null,
      statusText: error.response?.statusText || 'Request failed',
      error: error.response?.data?.error?.message || error.message
    });

    return buildFallbackResult(
      urgencyLevel,
      'AI triage is unavailable, so priority was based on the selected urgency.'
    );
  }
}

module.exports = {
  analyzePriority
};
