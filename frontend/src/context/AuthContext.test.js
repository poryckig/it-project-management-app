import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import axios from 'axios';
import { AuthProvider, useAuth } from './AuthContext';

jest.mock('axios');

const mockUser = {
  id: 1,
  username: 'testuser',
};

const AuthConsumer = () => {
  const { user, loading, handleLogin, handleLogout, handleRegister } = useAuth();

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>{user ? `User: ${user.username}` : 'No user'}</p>
      )}
      <button onClick={() => handleLogin('testuser', 'password')}>Login</button>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => handleRegister('newuser', 'password')}>Register</button>
    </div>
  );
};

const renderWithAuthProvider = (ui) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe('AuthContext', () => {
  test('loads user profile on mount', async () => {
    // Given
    localStorage.setItem('userToken', 'testtoken');
    axios.get.mockResolvedValueOnce({ data: mockUser });

    // When
    await act(async () => {
      renderWithAuthProvider(<AuthConsumer />);
    });

    // Then
    await waitFor(() => {
      expect(screen.getByText('User: testuser')).toBeInTheDocument();
    });
  });

  test('handles login', async () => {
    // Given
    axios.post.mockResolvedValueOnce({ data: { token: 'testtoken' } });
    axios.get.mockResolvedValueOnce({ data: mockUser });

    await act(async () => {
      renderWithAuthProvider(<AuthConsumer />);
    });

    const loginButton = screen.getByText('Login');

    // When
    fireEvent.click(loginButton);

    // Then
    await waitFor(() => {
      expect(screen.getByText('User: testuser')).toBeInTheDocument();
    });
  });

  test('handles logout', async () => {
    // Given
    localStorage.setItem('userToken', 'testtoken');
    axios.get.mockResolvedValueOnce({ data: mockUser });
    axios.post.mockResolvedValueOnce({});

    await act(async () => {
      renderWithAuthProvider(<AuthConsumer />);
    });

    await waitFor(() => {
      expect(screen.getByText('User: testuser')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');

    // When
    fireEvent.click(logoutButton);

    // Then
    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });

  test('handles register', async () => {
    // Given
    axios.post.mockResolvedValueOnce({ status: 201 });

    delete window.location;
    window.location = { href: '' };

    await act(async () => {
      renderWithAuthProvider(<AuthConsumer />);
    });

    const registerButton = screen.getByText('Register');

    // When
    fireEvent.click(registerButton);

    // Then
    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });
  });
});