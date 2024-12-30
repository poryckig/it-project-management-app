import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'http://localhost:3000/api/v1';

const Home = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false); 
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [isCreateDisabled, setIsCreateDisabled] = useState(true);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/projects`, {
                    withCredentials: true,
                });
                setProjects(response.data);
                setFilteredProjects(response.data);
            } catch (error) {
                console.error('Failed to fetch projects', error);
            }
        };

        fetchProjects();
    }, [user, navigate]);

    useEffect(() => {
        setFilteredProjects(
            projects.filter(project =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, projects]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (userSearchTerm.trim() === '') {
                setUserSearchResults([]);
                return;
            }
    
            try {
                const response = await axios.get(`${BASE_URL}/users/search`, {
                    params: { query: userSearchTerm },
                    withCredentials: true,
                });
    
                const filteredUsers = response.data.filter((searchedUser) => 
                    searchedUser.id !== user.id && !selectedUsers.some(selectedUser => selectedUser.id === searchedUser.id)
                );
    
                setUserSearchResults(filteredUsers);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
    
        fetchUsers();
    }, [userSearchTerm, user.id, selectedUsers]);
    
    const handleCreateProject = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/projects`, {
                name: newProjectName.trim(),
                description: newProjectDescription.trim(),
            }, {
                withCredentials: true,
            });
    
            const projectId = response.data.id;
    
            if (selectedUsers.length > 0) {
                const usersToInvite = selectedUsers.filter(selectedUser => selectedUser.id !== user.id);
                if (usersToInvite.length > 0) {
                    await axios.post(`${BASE_URL}/projects/${projectId}/invite`, {
                        usernames: usersToInvite.map(user => user.username),
                    }, {
                        withCredentials: true,
                    });
                }
            }
    
            setProjects([...projects, { ...response.data, managedBy: user }]);
            setNewProjectName('');
            setNewProjectDescription('');
            setSelectedUsers([]);
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to create project', error);
        }
    };

    const handleProjectNameChange = (e) => {
        const value = e.target.value;
        setNewProjectName(value);
        setIsCreateDisabled(value.trim() === '');
    };

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setNewProjectName('');
        setNewProjectDescription('');
        setSelectedUsers([]);
    };

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}/synopsis`);
    };

    const handleUserSearchChange = (e) => {
        setUserSearchTerm(e.target.value);
    };

    const handleUserSelect = (selectedUser) => {
        if (selectedUser.id === user.id) {
            alert('You cannot add yourself to the project.');
            return;
        }

        if (!selectedUsers.some(existingUser => existingUser.id === selectedUser.id)) {
            setSelectedUsers([...selectedUsers, selectedUser]);
        }
        setUserSearchTerm('');
        setUserSearchResults([]);
    };

    const handleUserRemove = (userId) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mt-6">
                <h1 className="text-3xl font-bold">{t('Projects')}</h1>
                <input
                    type="text"
                    placeholder={t('Filter projects')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded px-3 py-1"
                />
                <button
                    onClick={handleOpenDialog}
                    className="ml-4 px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                >
                    + {t('Create a project')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="p-4 border rounded bg-white cursor-pointer h-48"
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <h2 className="text-center text-2xl font-bold">{project.name}</h2>
                            <p>{project.description}</p>
                            <p className="text-sm text-gray-500 mt-5">
                                {t('Project Manager')}: {project.managedBy ? project.managedBy.username : "Brak kierownika"}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>{t('No projects.')}</p>
                )}
            </div>

            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl text-center font-bold">{t('Create a new project')}</h2>
                        <input
                            type="text"
                            placeholder={t('Project name') + ' *'}
                            value={newProjectName}
                            onChange={handleProjectNameChange}
                            className="border rounded w-full px-3 py-2.5 mb-4 mt-4"
                        />
                        <input
                            type="text"
                            placeholder={t('Project description')}
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            className="border rounded w-full px-3 py-2.5 mb-4"
                        />
                        <input
                            type="text"
                            placeholder={t('Add users')}
                            value={userSearchTerm}
                            onChange={handleUserSearchChange}
                            className="border rounded w-full px-3 py-2.5 mb-4"
                        />
                        {userSearchResults.length > 0 && (
                            <ul className="border rounded w-full px-3 py-2.5 mb-4">
                                {userSearchResults.map(user => (
                                    <li
                                        key={user.id}
                                        className="cursor-pointer hover:bg-gray-200"
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        {user.username}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mb-4">
                            {selectedUsers.map(user => (
                                <span
                                    key={user.id}
                                    className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                                >
                                    {user.username}
                                    <button
                                        className="ml-2 text-red-500"
                                        onClick={() => handleUserRemove(user.id)}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseDialog}
                                className="mr-2 px-4 py-2 text-gray-700 hover:bg-[#efebeb] font-medium border border-gray-300 rounded-lg duration-150"
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                onClick={handleCreateProject}
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

export default Home;