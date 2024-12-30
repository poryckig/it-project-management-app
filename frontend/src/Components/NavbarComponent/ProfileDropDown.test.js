import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProfileDropDown from './ProfileDropDown';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockUser = { id: 1, username: 'testuser' };
const mockHandleLogout = jest.fn();

beforeEach(() => {
  useAuth.mockReturnValue({
    user: mockUser,
    handleLogout: mockHandleLogout,
  });
});

describe('ProfileDropDown', () => {
  test('renders ProfileDropDown component', () => {
    // Given
    render(
      <BrowserRouter>
        <ProfileDropDown />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByAltText('testuser')).toBeInTheDocument();
  });

  test('toggles dropdown menu when button is clicked', async () => {
    // Given
    render(
      <BrowserRouter>
        <ProfileDropDown />
      </BrowserRouter>
    );

    const button = screen.getByAltText('testuser');

    // When
    await act(async () => {
      fireEvent.click(button);
    });

    // Then
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();

    // When
    await act(async () => {
      fireEvent.click(button);
    });

    // Then
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Log out')).not.toBeInTheDocument();
  });

  test('closes dropdown menu when clicking outside', async () => {
    // Given
    render(
      <BrowserRouter>
        <ProfileDropDown />
      </BrowserRouter>
    );

    const button = screen.getByAltText('testuser');
    await act(async () => {
      fireEvent.click(button);
    });

    // Then
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();

    // When
    await act(async () => {
      fireEvent.mouseDown(document);
    });

    // Then
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Log out')).not.toBeInTheDocument();
    });
  });

  test('logs out user when logout button is clicked', async () => {
    // Given
    render(
      <MemoryRouter initialEntries={['/']}>
        <ProfileDropDown />
      </MemoryRouter>
    );

    const button = screen.getByAltText('testuser');
    await act(async () => {
      fireEvent.click(button);
    });

    // When
    const logoutButton = screen.getByText('Log out');
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // Then
    expect(mockHandleLogout).toHaveBeenCalled();
  });
});