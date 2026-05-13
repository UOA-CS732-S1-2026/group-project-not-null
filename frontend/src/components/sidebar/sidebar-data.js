import {
  CircleHelp,
  LayoutDashboard,
  Settings,
  ShieldCheck,
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
        { title: 'Help', url: '/help', icon: CircleHelp },
        { title: 'Settings', url: '/settings', icon: Settings },
      ],
    },
    {
      title: 'Admin',
      items: [
        { title: 'Admin Panel', url: '/admin', icon: ShieldCheck },
        { title: 'Tickets', url: '/admin/tickets', icon: TicketCheck },
      ],
    },
  ],
}
