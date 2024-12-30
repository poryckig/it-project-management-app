import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Home from './Home';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('axios');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const mockUser = { id: 1, username: 'testuser' };

beforeEach(() => {
  useAuth.mockReturnValue({
    user: mockUser,
  });
  axios.get.mockResolvedValue({ data: [] });
});

describe('Home', () => {
  test('renders Home component', async () => {
    // Given
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Project 1', description: 'Description 1', managedBy: { username: 'manager1' } },
        { id: 2, name: 'Project 2', description: 'Description 2', managedBy: { username: 'manager2' } },
      ],
    });

    // When
    await act(async () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
    });

    // Then
    await waitFor(() => {
      expect(screen.getByText(/Projects/i)).toBeInTheDocument();
      expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Project 2/i)).toBeInTheDocument();
    });
  });

  test('filters projects based on search term', async () => {
    // Given
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Project 1', description: 'Description 1', managedBy: { username: 'manager1' } },
        { id: 2, name: 'Project 2', description: 'Description 2', managedBy: { username: 'manager2' } },
      ],
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Project 2/i)).toBeInTheDocument();
    });

    // When
    fireEvent.change(screen.getByPlaceholderText(/Filter projects/i), { target: { value: 'Project 1' } });

    // Then
    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Project 2/i)).not.toBeInTheDocument();
  });

  test('opens and closes create project dialog', async () => {
    // Given
    await act(async () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
    });

    // When
    fireEvent.click(screen.getByText(/\+ Create a project/i));

    // Then
    expect(screen.getByText(/Create a new project/i)).toBeInTheDocument();

    // When
    fireEvent.click(screen.getByText(/Cancel/i));

    // Then
    expect(screen.queryByText(/Create a new project/i)).not.toBeInTheDocument();
  });

  test('handles project creation', async () => {
    // Given
    axios.post.mockResolvedValueOnce({
      data: { id: 3, name: 'New Project', description: 'New Description', managedBy: mockUser },
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
    });

    fireEvent.click(screen.getByText(/\+ Create a project/i));
    fireEvent.change(screen.getByPlaceholderText(/Project name \*/i), { target: { value: 'New Project' } });
    fireEvent.change(screen.getByPlaceholderText(/Project description/i), { target: { value: 'New Description' } });

    // When
    fireEvent.click(screen.getAllByText(/Create/i)[1]);

    // Then
    await waitFor(() => {
      expect(screen.getByText(/New Project/i)).toBeInTheDocument();
    });
  });

  test('handles project click', async () => {
    // Given
    axios.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Project 1', description: 'Description 1', managedBy: { username: 'manager1' } },
      ],
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    });

    // When
    fireEvent.click(screen.getByText(/Project 1/i));

    // Then
    expect(mockNavigate).toHaveBeenCalledWith('/projects/1/synopsis');
  });
});