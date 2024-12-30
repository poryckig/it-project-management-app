import React from 'react';
import { render, screen } from '@testing-library/react';
import UserPhoto from './UserPhoto';

const userPhotoStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '20px',
};

describe('UserPhoto', () => {
  test('renders UserPhoto component', () => {
    // Given
    render(<UserPhoto photo="test-photo-url" />);

    // Then
    const userPhoto = screen.getByAltText('Użytkownik');
    expect(userPhoto).toBeInTheDocument();
  });

  test('displays user photo', () => {
    // Given
    render(<UserPhoto photo="test-photo-url" />);

    // When
    const userPhoto = screen.getByAltText('Użytkownik');

    // Then
    expect(userPhoto).toHaveAttribute('src', 'test-photo-url');
  });

  test('applies correct styles to user photo', () => {
    // Given
    render(<UserPhoto photo="test-photo-url" />);

    // When
    const userPhoto = screen.getByAltText('Użytkownik');

    // Then
    expect(userPhoto).toHaveStyle(`width: ${userPhotoStyle.width}`);
    expect(userPhoto).toHaveStyle(`height: ${userPhotoStyle.height}`);
    expect(userPhoto).toHaveStyle(`border-radius: ${userPhotoStyle.borderRadius}`);
    expect(userPhoto).toHaveStyle(`object-fit: ${userPhotoStyle.objectFit}`);
    expect(userPhoto).toHaveStyle(`margin-bottom: ${userPhotoStyle.marginBottom}`);
  });
});