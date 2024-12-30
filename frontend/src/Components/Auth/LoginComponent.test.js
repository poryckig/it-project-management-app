import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginComponent from './LoginComponent';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockNavigate = jest.fn();
const mockHandleLogin = jest.fn();

beforeEach(() => {
  useAuth.mockReturnValue({
    handleLogin: mockHandleLogin,
  });
  useNavigate.mockReturnValue(mockNavigate);
});

describe('LoginComponent', () => {
  test('renders LoginComponent', () => {
    // Given
    render(
      <BrowserRouter>
        <LoginComponent />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  test('handles username and password input', () => {
    // Given
    render(
      <BrowserRouter>
        <LoginComponent />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    // When
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Then
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles show password button', () => {
    // Given
    render(
      <BrowserRouter>
        <LoginComponent />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/Password/i);
    const showPasswordButton = screen.getByText(/👁️/i);

    // When
    fireEvent.mouseDown(showPasswordButton);

    // Then
    expect(passwordInput.type).toBe('text');

    // When
    fireEvent.mouseUp(showPasswordButton);

    // Then
    expect(passwordInput.type).toBe('password');
  });

  test('handles login success', async () => {
    // Given
    mockHandleLogin.mockResolvedValue({});
    render(
      <BrowserRouter>
        <LoginComponent />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // When
    const signInButton = screen.getByText(/Sign in/i);
    fireEvent.click(signInButton);

    // Then
    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles login failure', async () => {
    // Given
    mockHandleLogin.mockRejectedValue(new Error('Invalid credentials'));
    render(
      <BrowserRouter>
        <LoginComponent />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // When
    const signInButton = screen.getByText(/Sign in/i);
    fireEvent.click(signInButton);

    // Then
    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('navigates to register page', () => {
    // Given
    render(
      <BrowserRouter>
        <LoginComponent />
      </BrowserRouter>
    );

    // When
    const signUpButton = screen.getByText(/Sign up/i);
    fireEvent.click(signUpButton);

    // Then
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});