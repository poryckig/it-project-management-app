import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'http://localhost:3000/api/v1';

const TaskDetails = () => {
  const { t } = useTranslation();
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [charsLeft, setCharsLeft] = useState(10000);
  const [showCharsLeft, setShowCharsLeft] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const descriptionRef = useRef(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
          withCredentials: true,
        });
        const taskData = response.data;

        const members = taskData.project.members.filter(member => member.id !== taskData.project.managedBy.id);
        taskData.project.members = [taskData.project.managedBy, ...members];

        setTask(taskData);
        setCharsLeft(10000 - taskData.description.length);
      } catch (error) {
        console.error('Failed to fetch task details', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/profile`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user details', error);
      }
    };

    fetchTaskDetails();
    fetchUserDetails();
  }, [projectId, taskId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
    if (name === 'description') {
      setCharsLeft(10000 - value.length);
    }
  };

  const handleSave = async () => {
    try {
      const updatedTask = {
        ...task,
        lastChange: new Date().toISOString(),
        priority: parseInt(task.priority, 10),
        description: task.description || "",
        assigneeId: task.assigneeId,
      };

      const response = await axios.put(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, updatedTask, {
        withCredentials: true,
      });
      setTask(response.data);
      setError('');
      setIsEditingName(false);
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
        withCredentials: true,
      });
      navigate(`/projects/${projectId}/zadania`);
    } catch (error) {
      console.error('Failed to delete task', error);
      setError('Failed to delete task');
    }
  };

  const handleFocus = () => {
    setShowCharsLeft(true);
  };

  const handleBlur = () => {
    setShowCharsLeft(false);
  };

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    const { value } = e.target;
    setTask((prevTask) => ({
      ...prevTask,
      name: value,
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  const isProjectManager = user && task.project && user.id === task.project.managedById;

  return (
    <div className="container mx-auto p-6 bg-white rounded shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <span className="text-3xl font-bold">{task.id}&nbsp;&nbsp;&nbsp;</span>
          {isEditingName ? (
            <input
              type="text"
              value={task.name}
              onChange={handleNameChange}
              onBlur={handleSave}
              autoFocus
              className="text-3xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-[#6A1515] w-full"
            />
          ) : (
            <h1 className="text-3xl font-bold cursor-pointer" onClick={handleNameClick}>
              {task.name}
            </h1>
          )}
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-8 flex items-center">
        <label className="block font-normal w-1/3">{t('Assigned')}</label>
        <select
          name="assigneeId"
          value={task.assigneeId || (task.project && task.project.managedById)}
          onChange={handleInputChange}
          className="border rounded px-3 py-1"
          style={{ width: 'auto' }}
        >
          {task.project && task.project.members && task.project.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.username}
            </option>
          ))}
        </select>
        <div className="ml-auto p-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
          >
            {t('Save')}
          </button>
        </div>
      </div>
      <div className="mb-5 flex items-center">
        <label className="block font-normal w-1/3">Status</label>
        <select
          name="status"
          value={task.status}
          onChange={handleInputChange}
          className="border rounded px-3 py-1"
          style={{ width: 'auto' }}
        >
          <option value="To Do">{t('To Do')}</option>
          <option value="In Progress">{t('In Progress')}</option>
          <option value="Done">{t('Done')}</option>
        </select>
        <div className="ml-auto p-4">
        {isProjectManager && (
          <button
            onClick={handleDelete}
            className="ml-4 px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
          >
            {t('Delete task')}
          </button>
        )}
        </div>
      </div>
      <div className="mb-5 flex items-center">
        <label className="block font-normal w-1/3">{t('Priority')}</label>
        <select
          name="priority"
          value={task.priority}
          onChange={handleInputChange}
          className="border rounded px-3 py-1"
          style={{ width: 'auto' }}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>
      <div className="mb-5 flex items-center">
        <label className="block font-normal w-1/3">{t('Last change')}</label>
        <p className="font-normal w-2/3">{format(new Date(task.lastChange), 'dd-MM-yyyy HH:mm:ss')}</p>
      </div>
      <div className="mb-5" ref={descriptionRef}>
        <label className="block mb-2 font-normal">{t('Description')}</label>
        <textarea
          name="description"
          value={task.description}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={10000}
          className="border rounded px-3 py-1 font-normal w-full h-32"
        />
        <div className="h-6">
          {showCharsLeft && (
            <p className="text-sm text-gray-500">Pozostało znaków: {charsLeft}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;