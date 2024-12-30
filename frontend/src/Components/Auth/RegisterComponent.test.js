import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterComponent from './RegisterComponent';
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
const mockHandleRegister = jest.fn();

beforeEach(() => {
  useAuth.mockReturnValue({
    handleRegister: mockHandleRegister,
  });
  useNavigate.mockReturnValue(mockNavigate);
});

describe('RegisterComponent', () => {
  test('renders RegisterComponent', () => {
    // Given
    render(
      <BrowserRouter>
        <RegisterComponent />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByRole('heading', { name: /Create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create an account/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
  });

  test('handles username and password input', () => {
    // Given
    render(
      <BrowserRouter>
        <RegisterComponent />
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
        <RegisterComponent />
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

  test('handles registration success', async () => {
    // Given
    mockHandleRegister.mockResolvedValue({});
    render(
      <BrowserRouter>
        <RegisterComponent />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // When
    const createAccountButton = screen.getByRole('button', { name: /Create an account/i });
    fireEvent.click(createAccountButton);

    // Then
    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('handles registration failure', async () => {
    // Given
    mockHandleRegister.mockRejectedValue(new Error('Registration failed'));
    render(
      <BrowserRouter>
        <RegisterComponent />
      </BrowserRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // When
    const createAccountButton = screen.getByRole('button', { name: /Create an account/i });
    fireEvent.click(createAccountButton);

    // Then
    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalledWith('testuser', 'password123');
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
    });
  });

  test('navigates to login page', () => {
    // Given
    render(
      <BrowserRouter>
        <RegisterComponent />
      </BrowserRouter>
    );

    // When
    const signInLink = screen.getByRole('link', { name: /Sign in/i });
    fireEvent.click(signInLink);

    // Then
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});