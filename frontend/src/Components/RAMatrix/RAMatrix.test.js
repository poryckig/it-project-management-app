import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RAMatrix from './RAMatrix';
import { useOutletContext } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key === 'RAM matrix' ? 'Macierz RAM' : key,
  }),
}));

const mockProject = {
  id: 1,
  name: 'Test Project',
  members: [
    { id: 1, username: 'manager' },
    { id: 2, username: 'member' },
  ],
  ramMatrix: null,
};

beforeEach(() => {
  useOutletContext.mockReturnValue({
    project: mockProject,
    updateProject: jest.fn(),
  });
});

const renderWithContext = (component) => {
  return render(
    <MemoryRouter initialEntries={['/projects/1/ram']}>
      <Routes>
        <Route path="/projects/:projectId/ram" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('RAMatrix', () => {
  test('renders RAMatrix component with basic elements', () => {
    // Given
    renderWithContext(<RAMatrix />);

    // Then
    expect(screen.getByText('Macierz RAM')).toBeInTheDocument();
    expect(screen.getByText('manager')).toBeInTheDocument();
    expect(screen.getByText('member')).toBeInTheDocument();
  });
});