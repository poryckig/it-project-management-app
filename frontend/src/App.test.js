import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';
import { AuthProvider } from './context/AuthContext';

jest.mock('axios');

const mockUser = {
  id: 1,
  username: 'testuser',
};

const renderWithProviders = (ui) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe('App', () => {
  test('renders login page when not authenticated', async () => {
    // Given
    axios.get.mockRejectedValueOnce({});

    // When
    renderWithProviders(<App />);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
    });
  });

  test('renders home page when authenticated', async () => {
    // Given
    localStorage.setItem('userToken', 'testtoken');
    axios.get.mockResolvedValueOnce({ data: mockUser });

    // When
    renderWithProviders(<App />);

    // Then
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});