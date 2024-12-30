import React from 'react';
import { render, screen } from '@testing-library/react';
import Synopsis from './Synopsis';
import { BrowserRouter } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

beforeEach(() => {
  useOutletContext.mockReturnValue({
    project: { id: 1, name: 'Test Project', description: 'Test Description', members: [{ id: 1, username: 'user1', managedById: 1 }] },
    user: { id: 1, username: 'manager' },
    updateProject: jest.fn(),
  });
});

describe('Synopsis', () => {
  test('renders Synopsis component', () => {
    // Given
    render(
      <BrowserRouter>
        <Synopsis />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/Test Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Description/i)).toBeInTheDocument();
  });
});