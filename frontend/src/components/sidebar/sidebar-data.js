import {
  BookOpen,
  CircleHelp,
  LayoutDashboard,
  Settings,
  TicketCheck,
} from 'lucide-react'

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
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Staff Tickets', url: '/staff/tickets', icon: TicketCheck, staffOnly: true },
      ],
    },
    {
      title: 'Other',
      items: [
        { title: 'Knowledge Base', url: '/knowledge-base', icon: BookOpen },
        { title: 'Help', url: '/help', icon: CircleHelp },
        { title: 'Settings', url: '/settings', icon: Settings },
      ],
    },
  ],
}
