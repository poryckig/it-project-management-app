import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CaseStudy from './CaseStudy';
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
      caseStudy: {
        content: 'Initial content',
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

describe('CaseStudy', () => {
  test('renders CaseStudy component', () => {
    // Given
    render(
      <BrowserRouter>
        <CaseStudy />
      </BrowserRouter>
    );

    // Then
    expect(screen.getByText(/Case study/i)).toBeInTheDocument();
    expect(screen.getByText(/Initial content/i)).toBeInTheDocument();
    expect(screen.getByText(/1.0.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Last modified 01-01-2023 01:00:00 by: user1/i)).toBeInTheDocument();
  });

  test('handles edit button click', () => {
    // Given
    render(
      <BrowserRouter>
        <CaseStudy />
      </BrowserRouter>
    );

    // When
    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // Then
    expect(screen.getByDisplayValue(/Initial content/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  test('handles content change', () => {
    // Given
    render(
      <BrowserRouter>
        <CaseStudy />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // When
    const textarea = screen.getByDisplayValue(/Initial content/i);
    fireEvent.change(textarea, { target: { value: 'Updated content' } });

    // Then
    expect(textarea.value).toBe('Updated content');
  });

  test('handles version change', () => {
    // Given
    render(
      <BrowserRouter>
        <CaseStudy />
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

  test('handles save button click with valid version', async () => {
    // Given
    const { updateProject, setProject } = useOutletContext();

    render(
      <BrowserRouter>
        <CaseStudy />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    const textarea = screen.getByDisplayValue(/Initial content/i);
    fireEvent.change(textarea, { target: { value: 'Updated content' } });

    const majorVersionSelect = screen.getByDisplayValue('1');
    fireEvent.change(majorVersionSelect, { target: { value: '2' } });

    // When
    const saveButton = screen.getByText(/Save/i);
    fireEvent.click(saveButton);

    // Then
    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith('caseStudy', expect.objectContaining({
        content: 'Updated content',
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
        <CaseStudy />
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

  test('displays characters left when editing', () => {
    // Given
    render(
      <BrowserRouter>
        <CaseStudy />
      </BrowserRouter>
    );

    const editButton = screen.getByText(/Edit/i);
    fireEvent.click(editButton);

    // Then
    expect(screen.getByText(/Characters left: 9985/i)).toBeInTheDocument();
  });
});