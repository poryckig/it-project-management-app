import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'http://localhost:3000/api/v1';

const Tasks = () => {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isCreateDisabled, setIsCreateDisabled] = useState(true);
  const [sortOrder, setSortOrder] = useState(localStorage.getItem('taskSortOrder') || 'desc');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/projects/${projectId}/tasks`, {
          withCredentials: true,
        });
        const sortedTasks = response.data.sort((a, b) => sortOrder === 'asc' ? new Date(a.lastChange) - new Date(b.lastChange) : new Date(b.lastChange) - new Date(a.lastChange));
        setTasks(sortedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, sortOrder]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewTaskName('');
    setIsCreateDisabled(true);
  };

  const handleCreateTask = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/projects/${projectId}/tasks`, {
        name: newTaskName,
      }, {
        withCredentials: true,
      });
      const sortedTasks = [...tasks, response.data].sort((a, b) => sortOrder === 'asc' ? new Date(a.lastChange) - new Date(b.lastChange) : new Date(b.lastChange) - new Date(a.lastChange));
      setTasks(sortedTasks);
      setNewTaskName('');
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleTaskNameChange = (e) => {
    const value = e.target.value;
    setNewTaskName(value);
    setIsCreateDisabled(value.trim() === '');
  };

  const handleTaskClick = (taskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}`, { state: { from: `/projects/${projectId}/tasks` } });
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    localStorage.setItem('taskSortOrder', newSortOrder);
    setTasks([...tasks].sort((a, b) => newSortOrder === 'asc' ? new Date(a.lastChange) - new Date(b.lastChange) : new Date(b.lastChange) - new Date(a.lastChange)));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded shadow-lg">
      <div className="flex justify-between items-center mt-6 mb-6">
        <h1 className="text-3xl font-bold text-center w-full">{t('Tasks')}</h1>
        <button
          onClick={handleOpenDialog}
          className="px-4 py-2 -ml-36 whitespace-nowrap text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
        >
          + {t('Create a task')}
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">{t('Task name')}</th>
              <th className="py-2 px-4 border-b">{t('Assigned')}</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b cursor-pointer" onClick={handleSortToggle}>
                {t('Last change')} {sortOrder === 'asc' ? '▲' : '▼'}
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="py-2 px-4 border-b text-center">{task.id}</td>
                  <td className="py-2 px-4 border-b cursor-pointer" onClick={() => handleTaskClick(task.id)}>
                    <span className="hover:text-[#551111]">{task.name}</span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">{task.assignee ? task.assignee.username : t('No user assigned')}</td>
                  <td className="py-2 px-4 border-b text-center">{t(task.status)}</td>
                  <td className="py-2 px-4 border-b text-center">{format(new Date(task.lastChange), 'dd-MM-yyyy HH:mm:ss')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-2 px-4 border-b text-center">{t('No tasks.')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl text-center font-bold mb-4">{t('Create a task')}</h2>
            <input
              type="text"
              placeholder={t('Task name') + " *"}
              value={newTaskName}
              onChange={handleTaskNameChange}
              className="border rounded px-3 py-1 w-full mb-4 mt-3"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="mr-4 px-4 py-2 text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 rounded-lg duration-150"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={handleCreateTask}
                className={`px-4 py-2 text-white font-medium rounded-lg duration-150 ${isCreateDisabled ? 'bg-gray-400' : 'bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111]'}`}
                disabled={isCreateDisabled}
              >
                {t('Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;