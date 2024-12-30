import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from './Profile';
import { useAuth } from '../../context/AuthContext';
import avatar from '../../img/avatar-placeholder.png';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockUser = {
  username: 'testuser',
  registeredAt: '2022-01-01T00:00:00Z',
  image: 'test-image-url',
};

beforeEach(() => {
  useAuth.mockReturnValue({
    user: mockUser,
  });
});

describe('Profile', () => {
  test('renders Profile component', () => {
    // Given
    render(<Profile />);

    // Then
    expect(screen.getByText(/Username/i)).toBeInTheDocument();
    expect(screen.getByText(/Join Date/i)).toBeInTheDocument();
  });

  test('displays user profile photo', () => {
    // Given
    render(<Profile />);

    // When
    const userPhoto = screen.getByAltText(/Użytkownik/i);

    // Then
    expect(userPhoto).toBeInTheDocument();
    expect(userPhoto).toHaveAttribute('src', 'test-image-url');
  });

  test('displays default profile photo when user image is not available', () => {
    // Given
    useAuth.mockReturnValueOnce({
      user: { ...mockUser, image: null },
    });
    render(<Profile />);

    // When
    const userPhoto = screen.getByAltText(/Użytkownik/i);

    // Then
    expect(userPhoto).toBeInTheDocument();
    expect(userPhoto).toHaveAttribute('src', avatar);
  });

  test('displays user username', () => {
    // Given
    render(<Profile />);

    // Then
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('displays user join date', () => {
    // Given
    render(<Profile />);

    // When
    const formattedDate = '01-01-2022 01:00:00';

    // Then
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});