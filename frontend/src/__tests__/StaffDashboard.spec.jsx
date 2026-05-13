import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/dashboard-page/Dashboard';

vi.mock('../services/api', () => ({
  getTickets: vi.fn(() =>
    Promise.resolve({
      tickets: [],
    })
  ),

  getStaffDashboardSummary: vi.fn(() =>
    Promise.resolve({
      assignedTicketCount: 2,
      resolvedToday: 1,
      highPriorityTickets: 1,
      averageResponseTime: '2h',
    })
  ),

  getStaffTickets: vi.fn(() =>
    Promise.resolve({
      tickets: [
        {
          _id: 'ticket-1',
          ticketNumber: '1001',
          title: 'Staff dashboard test ticket',
          description: 'Test ticket for staff dashboard',
          category: 'IT',
          urgency: 'High',
          priority: 'High',
          status: 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedToStaffId: {
            firstName: 'Test',
            lastName: 'Staff',
            email: 'staff@test.com',
          },
        },
      ],
    })
  ),

  getStaffUrgentTickets: vi.fn(() =>
    Promise.resolve({
      tickets: [],
    })
  ),

  getStaffDashboardAnalytics: vi.fn(() =>
    Promise.resolve({
      ticketsByCategory: [
        { label: 'IT', value: 1 },
      ],
      ticketsByStatus: [
        { label: 'Open', value: 1 },
      ],
    })
  ),

  getStaffActivity: vi.fn(() =>
    Promise.resolve({
      activity: [],
    })
  ),

  getStaffNotifications: vi.fn(() =>
    Promise.resolve({
      notifications: [],
    })
  ),
}));

describe('Staff Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();

    localStorage.setItem(
      'user',
      JSON.stringify({
        firstName: 'Test',
        lastName: 'Staff',
        email: 'staff@test.com',
        role: 'staff',
      })
    );

    localStorage.setItem('token', 'fake-staff-token');
  });

    it('renders the staff dashboard for staff users', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/staff dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/good afternoon, test staff/i)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /ticket queue/i })).toBeInTheDocument();

    const ticketTitles = await screen.findAllByText(/staff dashboard test ticket/i);
    expect(ticketTitles.length).toBeGreaterThan(0);
  });

  it('shows staff dashboard ticket information', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const ticketTitles = await screen.findAllByText(/staff dashboard test ticket/i);
    expect(ticketTitles.length).toBeGreaterThan(0);

    const categoryLabels = await screen.findAllByText('IT', { exact: true });
    expect(categoryLabels.length).toBeGreaterThan(0);

    expect(await screen.findByRole('heading', { name: /ticket queue/i })).toBeInTheDocument();
  });
});