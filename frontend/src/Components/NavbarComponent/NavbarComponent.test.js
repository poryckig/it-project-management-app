import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NavbarComponent from './NavbarComponent';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockUser = { id: 1, username: 'testuser' };

beforeEach(() => {
  useAuth.mockReturnValue({
    user: mockUser,
  });
  axios.get.mockResolvedValue({ data: [] });
  axios.post.mockResolvedValue({});
  axios.delete.mockResolvedValue({});
});

describe('NavbarComponent', () => {
  test('renders NavbarComponent', async () => {
    // Given
    await act(async () => {
      render(
        <BrowserRouter>
          <NavbarComponent />
        </BrowserRouter>
      );
    });

    // Then
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Notifications (0)')).toBeInTheDocument();
  });

  test('displays notifications', async () => {
    // Given
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, content: 'Notification 1' },
        { id: 2, content: 'Notification 2' },
      ],
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <NavbarComponent />
        </BrowserRouter>
      );
    });

    // Then
    await waitFor(() => {
      expect(screen.getByText('Notifications (2)')).toBeInTheDocument();
    });
  });

  test('toggles notifications dropdown', async () => {
    // Given
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, content: 'Notification 1' },
        { id: 2, content: 'Notification 2' },
      ],
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <NavbarComponent />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Notifications (2)')).toBeInTheDocument();
    });

    // When
    await act(async () => {
      fireEvent.click(screen.getByText('Notifications (2)'));
    });

    // Then
    expect(screen.getByText('Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Notification 2')).toBeInTheDocument();

    // When
    await act(async () => {
      fireEvent.click(screen.getByText('Notifications (2)'));
    });

    // Then
    expect(screen.queryByText('Notification 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Notification 2')).not.toBeInTheDocument();
  });

  test('handles notification click', async () => {
    // Given
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, content: 'Notification 1' },
      ],
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <NavbarComponent />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Notifications (1)')).toBeInTheDocument();
    });

    // When
    await act(async () => {
      fireEvent.click(screen.getByText('Notifications (1)'));
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Notification 1')[0]);
    });

    // Then
    expect(screen.getByText('Notification 1', { selector: 'p' })).toBeInTheDocument();
  });

  test('closes notifications dropdown when clicking outside', async () => {
    // Given
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, content: 'Notification 1' },
      ],
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <NavbarComponent />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Notifications (1)')).toBeInTheDocument();
    });

    // When
    await act(async () => {
      fireEvent.click(screen.getByText('Notifications (1)'));
    });

    // Then
    expect(screen.getByText('Notification 1')).toBeInTheDocument();

    // When
    await act(async () => {
      fireEvent.mouseDown(document);
    });

    // Then
    await waitFor(() => {
      expect(screen.queryByText('Notification 1')).not.toBeInTheDocument();
    });
  });

  test('renders Profile dropdown and navigates to profile page', async () => {
    // Given
    await act(async () => {
      render(
        <BrowserRouter>
          <NavbarComponent />
        </BrowserRouter>
      );
    });

    // When
    const profileButton = screen.getByAltText('testuser');
    fireEvent.click(profileButton);

    // Then
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();

    // When
    fireEvent.click(screen.getByText('Profile'));

    // Then
    expect(window.location.pathname).toBe('/profile');
  });
});