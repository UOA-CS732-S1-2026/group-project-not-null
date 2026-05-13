export const ticketCategories = [
  'IT',
  'Enrolment',
  'Academic',
  'Accommodation',
]

export const urgencyLevels = ['Low', 'Medium', 'High']

export const studentTickets = [
  {
    id: '2048',
    title: "Can't access Canvas",
    category: 'IT',
    status: 'In Progress',
    urgency: 'High',
    priority: 'Critical',
    submitted: '2 days ago',
    updated: 'Today',
    description:
      'I cannot access my course materials in Canvas. The login page keeps redirecting and I have already reset my password.',
    staffResponse:
      'IT has confirmed your account is active. We are checking your Canvas enrolment sync now.',
    timeline: ['Open', 'In Progress'],
  },
  {
    id: '2039',
    title: 'Course enrolment change',
    category: 'Enrolment',
    status: 'Open',
    urgency: 'Medium',
    priority: 'High',
    submitted: '1 day ago',
    updated: '1 day ago',
    description:
      'I need to swap one elective before the deadline because it clashes with a required lab.',
    staffResponse: '',
    timeline: ['Open'],
  },
  {
    id: '1998',
    title: 'Assessment extension evidence',
    category: 'Academic',
    status: 'Resolved',
    urgency: 'Low',
    priority: 'Low',
    submitted: '9 days ago',
    updated: '3 days ago',
    description:
      'I uploaded my extension evidence but wanted to confirm it has been received by the academic office.',
    staffResponse: 'Your evidence was received and attached to your extension request.',
    timeline: ['Open', 'In Progress', 'Resolved'],
  },
  {
    id: '1944',
    title: 'Fee statement question',
    category: 'Accommodation/Finance',
    status: 'Resolved',
    urgency: 'Medium',
    priority: 'Medium',
    submitted: '3 weeks ago',
    updated: '2 weeks ago',
    description:
      'My accommodation fee statement looks higher than expected and I would like an explanation of the extra charge.',
    staffResponse: 'The extra charge was a refundable bond. Your statement has been updated.',
    timeline: ['Open', 'In Progress', 'Resolved'],
  },
]

export function assignPriority(category, urgency) {
  if (urgency === 'High' && ['IT', 'Accommodation/Finance'].includes(category)) {
    return 'Critical'
  }

  if (urgency === 'High') {
    return 'High'
  }

  if (urgency === 'Medium' && category === 'Enrolment') {
    return 'High'
  }

  return urgency
}
