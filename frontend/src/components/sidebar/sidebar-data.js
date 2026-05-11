import {
  BookOpen,
  CircleHelp,
  Home,
  LayoutDashboard,
  Settings,
  TicketCheck,
  Users,
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
        { title: 'Home', url: '/home', icon: Home },
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Tickets', url: '/tickets', icon: TicketCheck, badge: '12' },
        { title: 'Students', url: '/students', icon: Users },
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
