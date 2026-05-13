import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SignIn from '../pages/sign-in/SignIn';

vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
}));

describe('SignIn', () => {
  it('renders the sign in page', () => {
  render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  );

  expect(
    screen.getByRole('region', { name: /sign in/i })
  ).toBeInTheDocument();
});

  it('shows email and password fields', () => {
    render(
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows the sign in button', () => {
    render(
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });
});