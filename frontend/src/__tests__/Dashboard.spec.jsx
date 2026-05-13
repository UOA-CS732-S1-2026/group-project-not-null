import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/dashboard-page/Dashboard';

describe('Student Dashboard', () => {
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

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            tickets: [
              {
                _id: '1',
                title: 'Test IT ticket',
                description: 'This is a test ticket',
                category: 'IT',
                urgency: 'High',
                priority: 'High',
                status: 'Open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          }),
      })
    );
  });

  it('renders the student dashboard without crashing', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/my support/i)).toBeInTheDocument();
  });

  it('shows dashboard summary information', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const summarySection = await screen.findByLabelText(/ticket summary/i);

    expect(within(summarySection).getByText(/open tickets/i)).toBeInTheDocument();
    expect(within(summarySection).getByText(/in progress/i)).toBeInTheDocument();
    expect(within(summarySection).getByText(/resolved/i)).toBeInTheDocument();
  });

  it('shows ticket filters', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/category/i)).toBeInTheDocument();
  });
});