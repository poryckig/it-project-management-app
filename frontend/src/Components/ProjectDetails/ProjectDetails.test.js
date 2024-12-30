import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import ProjectDetails from './ProjectDetails';

jest.mock('axios');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockProject = {
  id: 1,
  name: 'Test Project',
  managedBy: { id: 1, username: 'manager' },
  members: [{ id: 2, username: 'member' }],
};

const mockUser = { id: 1, username: 'manager' };

beforeEach(() => {
  axios.get.mockResolvedValueOnce({ data: mockProject });
  axios.get.mockResolvedValueOnce({ data: mockUser });
});

describe('ProjectDetails', () => {
  test('fetches and displays project details', async () => {
    // Given
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/projects/1']}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // When
    await waitFor(() => {
      // Then
      expect(screen.getByText('General information')).toBeInTheDocument();
    });

    expect(screen.getByText('General information')).toBeInTheDocument();
    expect(screen.getByText('Case study')).toBeInTheDocument();
    expect(screen.getByText('Project statutes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('RAM matrix')).toBeInTheDocument();
  });

  test('displays correct navigation links', async () => {
    // Given
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/projects/1']}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectDetails />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // When
    await waitFor(() => {
      // Then
      expect(screen.getByText('General information')).toBeInTheDocument();
    });

    expect(screen.getByText('General information')).toBeInTheDocument();
    expect(screen.getByText('Case study')).toBeInTheDocument();
    expect(screen.getByText('Project statutes')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('RAM matrix')).toBeInTheDocument();
  });
});