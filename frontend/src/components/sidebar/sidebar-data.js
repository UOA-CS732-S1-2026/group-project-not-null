export const sidebarData = {
  team: {
    name: 'Uni Desk',
    plan: 'Student Support Portal',
    initials: 'UD',
  },
  user: {
    name: 'Anna Taylor',
    email: 'anna@university.edu',
    initials: 'AT',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        { title: 'Home', url: '/home', icon: '⌂' },
        { title: 'Dashboard', url: '/dashboard', icon: '⌂' },
        { title: 'Tickets', url: '/tickets', icon: '▣', badge: '12' },
        { title: 'Students', url: '/students', icon: '◉' },
      ],
    },
    {
      title: 'Other',
      items: [
        { title: 'Knowledge Base', url: '/knowledge-base', icon: '?' },
        { title: 'Settings', url: '/settings', icon: '⚙' },
      ],
    },
  ],
}
