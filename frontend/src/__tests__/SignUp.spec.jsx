import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignUp from '../pages/sign-up/SignUp';

vi.mock('../services/api', () => ({
  registerUser: vi.fn(),
}));

describe('SignUp', () => {
  it('renders the sign up page', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('region', { name: /create an account/i })
    ).toBeInTheDocument();
  });

  it('shows required registration fields', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows account type options', () => {
    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    expect(screen.getByRole('radio', { name: /student/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /staff/i })).toBeInTheDocument();
  });
});