import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';

const mockChangeLanguage = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

describe('LanguageSwitcher', () => {
  test('renders LanguageSwitcher component', () => {
    // Given
    render(<LanguageSwitcher />);

    // Then
    expect(screen.getByText('Change language')).toBeInTheDocument();
  });

  test('toggles dropdown on button click', () => {
    // Given
    render(<LanguageSwitcher />);
    const button = screen.getByText('Change language');

    // When
    fireEvent.click(button);

    // Then
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Polish')).toBeInTheDocument();

    // When
    fireEvent.click(button);

    // Then
    expect(screen.queryByText('English')).not.toBeInTheDocument();
    expect(screen.queryByText('Polish')).not.toBeInTheDocument();
  });

  test('changes language to English', () => {
    // Given
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText('Change language'));

    // When
    fireEvent.click(screen.getByText('English'));

    // Then
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  test('changes language to Polish', () => {
    // Given
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText('Change language'));

    // When
    fireEvent.click(screen.getByText('Polish'));

    // Then
    expect(mockChangeLanguage).toHaveBeenCalledWith('pl');
  });

  test('closes dropdown when clicking outside', async () => {
    // Given
    render(<LanguageSwitcher />);
    fireEvent.click(screen.getByText('Change language'));

    // Then
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Polish')).toBeInTheDocument();

    // When
    fireEvent.mouseDown(document);

    // Then
    await waitFor(() => {
      expect(screen.queryByText('English')).not.toBeInTheDocument();
      expect(screen.queryByText('Polish')).not.toBeInTheDocument();
    });
  });
});