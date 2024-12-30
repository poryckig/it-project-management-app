import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Tasks from './Tasks';

jest.mock('axios');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockTasks = [
  {
    id: 1,
    name: 'Task 1',
    assignee: { username: 'user1' },
    status: 'To Do',
    lastChange: '2023-10-01T12:00:00Z',
  },
  {
    id: 2,
    name: 'Task 2',
    assignee: { username: 'user2' },
    status: 'In Progress',
    lastChange: '2023-10-02T12:00:00Z',
  },
];

beforeEach(() => {
  axios.get.mockResolvedValueOnce({ data: mockTasks });
});

const renderWithRouter = async (component) => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/projects/1/tasks']}>
        <Routes>
          <Route path="/projects/:projectId/tasks" element={component} />
        </Routes>
      </MemoryRouter>
    );
  });
};

describe('Tasks', () => {
  test('renders Tasks component and displays tasks', async () => {
    // Given
    await renderWithRouter(<Tasks />);

    // Then
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('opens and closes create task dialog, and enables/disables create button based on input', async () => {
    // Given
    await renderWithRouter(<Tasks />);

    const createButton = screen.getByText('+ Create a task');
    fireEvent.click(createButton);

    // Then
    await waitFor(() => {
      expect(screen.getByText('Create a task')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Task name *');
    const createTaskButton = screen.getByText('Create');

    // When
    fireEvent.change(input, { target: { value: 'New Task' } });

    // Then
    expect(createTaskButton).not.toBeDisabled();

    // When
    fireEvent.change(input, { target: { value: '' } });

    // Then
    expect(createTaskButton).toBeDisabled();

    // When
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Then
    await waitFor(() => {
      expect(screen.queryByText('Create a task')).not.toBeInTheDocument();
    });
  });

  test('creates a new task', async () => {
    // Given
    axios.post.mockResolvedValueOnce({
      data: {
        id: 3,
        name: 'New Task',
        assignee: null,
        status: 'To Do',
        lastChange: '2023-10-03T12:00:00Z',
      },
    });

    await renderWithRouter(<Tasks />);

    const createButton = screen.getByText('+ Create a task');
    fireEvent.click(createButton);

    const input = screen.getByPlaceholderText('Task name *');
    fireEvent.change(input, { target: { value: 'New Task' } });

    const createTaskButton = screen.getByText('Create');
    fireEvent.click(createTaskButton);

    // Then
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
  });
});