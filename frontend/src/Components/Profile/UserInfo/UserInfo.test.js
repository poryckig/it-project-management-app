import React from 'react';
import { render, screen } from '@testing-library/react';
import UserInfo from './UserInfo';

const infoStyle = {
  marginBottom: '10px',
  fontSize: '16px',
};

const labelStyle = {
  fontWeight: 'bold',
};

describe('UserInfo', () => {
  test('renders UserInfo component', () => {
    // Given
    render(<UserInfo label="Username" value="testuser" />);

    // Then
    expect(screen.getByText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('displays correct label', () => {
    // Given
    render(<UserInfo label="Username" value="testuser" />);

    // When
    const label = screen.getByText(/Username:/i);

    // Then
    expect(label).toBeInTheDocument();
    expect(label).toHaveStyle(`font-weight: ${labelStyle.fontWeight}`);
  });

  test('displays correct value', () => {
    // Given
    render(<UserInfo label="Username" value="testuser" />);

    // When
    const value = screen.getByText('testuser');

    // Then
    expect(value).toBeInTheDocument();
  });

  test('applies correct styles to label and value', () => {
    // Given
    render(<UserInfo label="Username" value="testuser" />);

    // When
    const label = screen.getByText(/Username:/i);
    const value = screen.getByText('testuser');

    // Then
    expect(label).toHaveStyle(`font-weight: ${labelStyle.fontWeight}`);
    expect(label.parentElement).toHaveStyle(`margin-bottom: ${infoStyle.marginBottom}`);
    expect(label.parentElement).toHaveStyle(`font-size: ${infoStyle.fontSize}`);
  });
});