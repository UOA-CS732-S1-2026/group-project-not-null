import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminTicketsPage from '../pages/admin-tickets-page/AdminTicketsPage';

vi.mock('../services/api', () => ({
  getAdminTickets: vi.fn(() =>
    Promise.resolve({
      tickets: [
        {
          _id: 'ticket-1',
          ticketNumber: '1001',
          title: 'Student test ticket',
          category: 'IT',
          urgency: 'High',
          priority: 'High',
          status: 'open',
          assignedToStaffId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
  ),
  getAdminAllStaff: vi.fn(() =>
    Promise.resolve({
      staff: [
        {
          _id: 'staff-1',
          firstName: 'Test',
          lastName: 'Staff',
          email: 'staff@test.com',
          staffStatus: 'active',
        },
      ],
    })
  ),
  assignTicket: vi.fn(() => Promise.resolve({})),
}));

describe('AdminTicketsPage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-admin-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        role: 'admin',
      })
    );
  });

  it('renders the admin tickets page', async () => {
    render(
      <MemoryRouter>
        <AdminTicketsPage />
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /tickets/i })).toBeInTheDocument();
  });

  it('shows admin ticket data', async () => {
    render(
      <MemoryRouter>
        <AdminTicketsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/student test ticket/i)).toBeInTheDocument();
  });

  it('shows ticket management controls', async () => {
    render(
      <MemoryRouter>
        <AdminTicketsPage />
      </MemoryRouter>
    );

    expect(await screen.findByPlaceholderText(/search by title/i)).toBeInTheDocument();
    expect(await screen.findByText(/unassigned/i)).toBeInTheDocument();
  });
});