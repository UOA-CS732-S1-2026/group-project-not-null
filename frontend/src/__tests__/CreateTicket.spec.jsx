import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateTicket from '../pages/create-ticket-page/CreateTicket';

vi.mock('../services/api', () => ({
  createTicket: vi.fn(() =>
    Promise.resolve({
      ticket: {
        _id: 'ticket-1',
        title: 'Test ticket',
        description: 'This is a test ticket',
        category: 'IT',
        urgency: 'High',
        priority: 'High',
        status: 'Open',
      },
    })
  ),
}));

describe('CreateTicket', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        firstName: 'Test',
        lastName: 'Student',
        email: 'student@test.com',
        role: 'student',
      })
    );
  });

  it('renders the create ticket page', () => {
    render(
      <MemoryRouter>
        <CreateTicket />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /create ticket/i })).toBeInTheDocument();
  });

  it('shows required ticket form fields', () => {
    render(
      <MemoryRouter>
        <CreateTicket />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('shows category and urgency fields', () => {
  render(
    <MemoryRouter>
      <CreateTicket />
    </MemoryRouter>
  );

  expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: /urgency level/i })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: /low/i })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: /medium/i })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: /high/i })).toBeInTheDocument();
});

});