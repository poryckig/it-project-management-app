import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectSettings from './ProjectSettings';
import { BrowserRouter } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: jest.fn(),
}));

beforeEach(() => {
  useOutletContext.mockReturnValue({
    project: { name: 'Test Project', description: 'Test Description' },
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    showDeleteConfirmation: false,
    setShowDeleteConfirmation: jest.fn(),
    setProject: jest.fn(),
  });
});

describe('ProjectSettings', () => {
  test('renders ProjectSettings component', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectSettings />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/Project settings/i)).toBeInTheDocument();
  });

  test('renders project name and description', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectSettings />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByDisplayValue(/Test Project/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Test Description/i)).toBeInTheDocument();
  });

  test('handles name change', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectSettings />
      </BrowserRouter>
    );

    const nameInput = screen.getByDisplayValue(/Test Project/i);

    // When
    fireEvent.change(nameInput, { target: { value: 'Updated Project' } });

    // Then
    expect(nameInput.value).toBe('Updated Project');
  });

  test('handles description change', () => {
    // Given
    render(
      <BrowserRouter>
        <ProjectSettings />
      </BrowserRouter>
    );

    const descriptionInput = screen.getByDisplayValue(/Test Description/i);

    // When
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });

    // Then
    expect(descriptionInput.value).toBe('Updated Description');
  });

  test('handles delete button click', () => {
    // Given
    const { setShowDeleteConfirmation } = useOutletContext();

    render(
      <BrowserRouter>
        <ProjectSettings />
      </BrowserRouter>
    );

    const deleteButton = screen.getByText(/Delete project/i);

    // When
    fireEvent.click(deleteButton);

    // Then
    expect(setShowDeleteConfirmation).toHaveBeenCalledWith(true);
  });
});