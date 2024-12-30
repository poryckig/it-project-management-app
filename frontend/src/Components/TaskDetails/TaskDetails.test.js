import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import TaskDetails from './TaskDetails';

jest.mock('axios');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockTask = {
  id: 1,
  name: 'Test Task',
  description: 'This is a test task description.',
  status: 'To Do',
  priority: 3,
  lastChange: '2023-10-01T12:00:00Z',
  assigneeId: 1,
  project: {
    id: 1,
    name: 'Test Project',
    managedById: 1,
    managedBy: { id: 1, username: 'manager' },
    members: [
      { id: 1, username: 'manager' },
      { id: 2, username: 'member' },
    ],
  },
};

const mockUser = {
  id: 1,
  username: 'manager',
};

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/tasks/')) {
      return Promise.resolve({ data: mockTask });
    }
    if (url.includes('/profile')) {
      return Promise.resolve({ data: mockUser });
    }
    return Promise.reject(new Error('not found'));
  });
});

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter initialEntries={['/projects/1/tasks/1']}>
      <Routes>
        <Route path="/projects/:projectId/tasks/:taskId" element={component} />
      </Routes>
    </MemoryRouter>
  );
};

describe('TaskDetails', () => {
  test('renders TaskDetails component', async () => {
    // Given
    await act(async () => {
      renderWithRouter(<TaskDetails />);
    });

    // Then
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task description.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('To Do')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
    expect(screen.getByText('01-10-2023 14:00:00')).toBeInTheDocument();
  });

  test('allows editing task name', async () => {
    // Given
    await act(async () => {
      renderWithRouter(<TaskDetails />);
    });

    const taskName = screen.getByText('Test Task');

    // When
    fireEvent.click(taskName);

    const input = screen.getByDisplayValue('Test Task');
    fireEvent.change(input, { target: { value: 'Updated Task' } });
    fireEvent.blur(input);

    // Then
    await waitFor(() => {
      expect(screen.getByDisplayValue('Updated Task')).toBeInTheDocument();
    });
  });

  test('allows changing task status', async () => {
    // Given
    await act(async () => {
      renderWithRouter(<TaskDetails />);
    });

    const statusSelect = screen.getByDisplayValue('To Do');

    // When
    fireEvent.change(statusSelect, { target: { value: 'In Progress' } });

    // Then
    await waitFor(() => {
      expect(screen.getByDisplayValue('In Progress')).toBeInTheDocument();
    });
  });

  test('allows changing task priority', async () => {
    // Given
    await act(async () => {
      renderWithRouter(<TaskDetails />);
    });

    const prioritySelect = screen.getByDisplayValue('3');

    // When
    fireEvent.change(prioritySelect, { target: { value: '5' } });

    // Then
    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });
  });

  test('allows changing task assignee', async () => {
    // Given
    await act(async () => {
      renderWithRouter(<TaskDetails />);
    });

    const assigneeSelect = screen.getByDisplayValue('manager');

    // When
    fireEvent.change(assigneeSelect, { target: { value: '2' } });

    // Then
    await waitFor(() => {
      expect(screen.getByDisplayValue('member')).toBeInTheDocument();
    });
  });

  test('allows editing task description', async () => {
    // Given
    await act(async () => {
      renderWithRouter(<TaskDetails />);
    });

    const descriptionTextarea = screen.getByDisplayValue('This is a test task description.');

    // When
    fireEvent.change(descriptionTextarea, { target: { value: 'Updated description' } });

    // Then
    await waitFor(() => {
      expect(screen.getByDisplayValue('Updated description')).toBeInTheDocument();
    });
  });

  test('displays character count when editing description', async () => {
    // Given
    await act(async () => {
      renderWithRouter(<TaskDetails />);
    });

    const descriptionTextarea = screen.getByDisplayValue('This is a test task description.');

    // When
    fireEvent.focus(descriptionTextarea);

    // Then
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.startsWith('Pozostało znaków:'))).toBeInTheDocument();
    });

    // When
    fireEvent.blur(descriptionTextarea);

    // Then
    await waitFor(() => {
      expect(screen.queryByText((content, element) => content.startsWith('Pozostało znaków:'))).not.toBeInTheDocument();
    });
  });
});