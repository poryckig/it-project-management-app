import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectStatutes from './ProjectStatutes';
import { BrowserRouter } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: jest.fn(),
}));
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

beforeEach(() => {
  useOutletContext.mockReturnValue({
    project: {
      projectStatutes: {
        content: [
          { title: 'Problem description', content: 'Initial problem description' },
          { title: 'Description of the main project goal', content: 'Initial main project goal' },
        ],
        version: '1.0.0',
        lastModified: '2023-01-01T00:00:00Z',
        modifiedBy: 'user1',
      },
    },
    updateProject: jest.fn(),
    setProject: jest.fn(),
  });
  useAuth.mockReturnValue({
    user: { username: 'user1' },
  });
});

describe('ProjectStatutes', () => {
  test('renders ProjectStatutes component', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/Project statutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Initial problem description/i)).toBeInTheDocument();
    expect(screen.getByText(/Initial main project goal/i)).toBeInTheDocument();
    expect(screen.getByText(/1.0.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Last modified 01-01-2023 01:00:00 by: user1/i)).toBeInTheDocument();
  });

  test('handles edit button click', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    // When
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // Then
    expect(screen.getByDisplayValue(/Initial problem description/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Initial main project goal/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  test('handles content change', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // When
    const textarea = screen.getByDisplayValue(/Initial problem description/i);
    fireEvent.change(textarea, { target: { value: 'Updated problem description' } });

    // Then
    expect(textarea.value).toBe('Updated problem description');
  });

  test('handles version change', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // When
    const majorVersionSelect = screen.getByDisplayValue('1');
    fireEvent.change(majorVersionSelect, { target: { value: '2' } });

    // Then
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  test('adds a new section', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // When
    const addSectionButton = screen.getByText(/Add new section/i);
    fireEvent.click(addSectionButton);

    // Then
    expect(screen.getAllByText(/Delete section/i)).toHaveLength(3);
  });

  test('removes a section', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // When
    const deleteSectionButton = screen.getAllByText(/Delete section/i)[0];
    fireEvent.click(deleteSectionButton);

    // Then
    expect(screen.getAllByText(/Delete section/i)).toHaveLength(1);
  });

  test('handles save button click with valid version', async () => {
    // Given
    const { updateProject, setProject } = useOutletContext();

    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    const textarea = screen.getByDisplayValue(/Initial problem description/i);
    fireEvent.change(textarea, { target: { value: 'Updated problem description' } });

    const majorVersionSelect = screen.getByDisplayValue('1');
    fireEvent.change(majorVersionSelect, { target: { value: '2' } });

    // When
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    // Then
    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith('projectStatutes', expect.objectContaining({
        content: expect.any(Array),
        version: '2.0.0',
        modifiedBy: 'user1',
      }));
      expect(setProject).toHaveBeenCalled();
    });
  });

  test('handles save button click with invalid version', async () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectStatutes />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // When
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/You must increase the version number before saving./i)).toBeInTheDocument();
    });
  });
});