import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ViewTicket from '../pages/view-ticket-page/ViewTicket';

vi.mock('../services/api', () => ({
  getTicket: vi.fn(() =>
    Promise.resolve({
      ticket: {
        _id: 'ticket-1',
        ticketNumber: '1001',
        title: 'Test ticket detail',
        description: 'This is a test ticket description.',
        category: 'IT',
        urgency: 'High',
        priority: 'High',
        status: 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedToStaffId: null,
        staffNotes: [],
        studentNotes: [],
      },
    })
  ),

  getStaffTicket: vi.fn(() =>
    Promise.resolve({
      ticket: {
        _id: 'ticket-1',
        ticketNumber: '1001',
        title: 'Test ticket detail',
        description: 'This is a test ticket description.',
        category: 'IT',
        urgency: 'High',
        priority: 'High',
        status: 'Open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedToStaffId: null,
        staffNotes: [],
        studentNotes: [],
      },
    })
  ),

  getStaffUsers: vi.fn(() =>
    Promise.resolve({
      users: [],
    })
  ),

  updateStaffTicket: vi.fn(),
  addStaffTicketNote: vi.fn(),
  addStaffTicketStudentNote: vi.fn(),
}));

describe('ViewTicket', () => {
  beforeEach(() => {
    localStorage.clear();

    localStorage.setItem(
      'user',
      JSON.stringify({
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@test.com',
        role: 'student',
      })
    );

    localStorage.setItem('token', 'fake-test-token');
  });

  it('renders the ticket detail page', async () => {
    render(
      <MemoryRouter initialEntries={['/tickets/ticket-1']}>
        <Routes>
          <Route path="/tickets/:ticketId" element={<ViewTicket />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: /test ticket detail/i })
    ).toBeInTheDocument();
  });

  it('shows ticket information', async () => {
  render(
    <MemoryRouter initialEntries={['/tickets/ticket-1']}>
      <Routes>
        <Route path="/tickets/:ticketId" element={<ViewTicket />} />
      </Routes>
    </MemoryRouter>
  );

  const categoryItems = await screen.findAllByText('IT', { exact: true });
  const priorityItems = await screen.findAllByText('High', { exact: true });
  const statusItems = await screen.findAllByText('Open', { exact: true });

  expect(categoryItems.length).toBeGreaterThan(0);
  expect(priorityItems.length).toBeGreaterThan(0);
  expect(statusItems.length).toBeGreaterThan(0);
});

  it('shows the ticket description', async () => {
    render(
      <MemoryRouter initialEntries={['/tickets/ticket-1']}>
        <Routes>
          <Route path="/tickets/:ticketId" element={<ViewTicket />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/this is a test ticket description/i)
    ).toBeInTheDocument();
  });
});