import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'http://localhost:3000/api/v1';

const Synopsis = () => {
    const { t } = useTranslation();
    const { project, user, updateProject } = useOutletContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isCreateDisabled, setIsCreateDisabled] = useState(true);

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

                const existingMemberUsernames = project.members.map(member => member.username);
                const filteredResults = response.data
                    .filter(user => !existingMemberUsernames.includes(user.username))
                    .sort((a, b) => a.username.localeCompare(b.username));

                setUserSearchResults(filteredResults);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };

        fetchUsers();
    }, [userSearchTerm, project.members]);

    useEffect(() => {
        setIsCreateDisabled(selectedUsers.length === 0);
    }, [selectedUsers]);

    if (!project) {
        return <div>Loading...</div>;
    }

    const members = project.members || [];
    const description = project.description || 'Brak opisu projektu';

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setUserSearchTerm('');
        setUserSearchResults([]);
        setSelectedUsers([]);
    };

    const handleUserSearchChange = (e) => {
        setUserSearchTerm(e.target.value);
    };

    const handleUserSelect = (selectedUser) => {
        if (!selectedUsers.some(existingUser => existingUser.id === selectedUser.id)) {
            setSelectedUsers([...selectedUsers, selectedUser]);
        }
        setUserSearchTerm('');
        setUserSearchResults([]);
    };

    const handleUserRemove = (userId) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    const handleInviteUsers = async () => {
        try {
            if (selectedUsers.length > 0) {
                await axios.post(`${BASE_URL}/projects/${project.id}/invite`, {
                    usernames: selectedUsers.map(user => user.username),
                }, {
                    withCredentials: true,
                });
            }

            setIsDialogOpen(false);
            setSelectedUsers([]);
        } catch (error) {
            console.error('Failed to invite users', error);
        }
    };

    const handleTransferLeadership = async (memberId) => {
        try {
            await axios.put(`${BASE_URL}/projects/${project.id}`, {
                managedById: memberId,
            }, {
                withCredentials: true,
            });

            updateProject('managedById', memberId);
        } catch (error) {
            console.error('Failed to transfer leadership', error);
        }
    };

    const isProjectManager = user && user.id === project.managedById;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl text-center font-bold mb-4">{project.name}</h2>
            <p className="text-lg mb-8">{description}</p>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{t('Project participants')} ({members.length})</h3>
                {isProjectManager && (
                    <button
                        onClick={handleOpenDialog}
                        className="px-4 py-2 mr-6 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                    >
                        + {t('Invite')}
                    </button>
                )}
            </div>
            <ul className="list-disc pl-6">
                {members.length > 0 ? (
                    members.map(member => (
                        <li key={member.id} className="font-normal mb-2 mt-2 flex justify-between items-center">
                            <span>
                                &nbsp; &nbsp; <span style={{ color: '#6A1515' }}>&#10039; &nbsp;</span> {member.id === project.managedById ? <span>{member.username} ({t('Project Manager')})</span> : member.username}
                            </span>
                            {isProjectManager && member.id !== project.managedById && (
                                <button
                                    onClick={() => handleTransferLeadership(member.id)}
                                    className="ml-4 px-2 py-1 text-sm text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                                >
                                    {t('Hand over the leadership')}
                                </button>
                            )}
                        </li>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">Brak członków projektu.</p>
                )}
            </ul>

            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl text-center font-bold">{t('Invite users')}</h2>
                        <input
                            type="text"
                            placeholder={t('Add users')}
                            value={userSearchTerm}
                            onChange={handleUserSearchChange}
                            className="border rounded w-full px-3 py-2.5 mb-4 mt-4"
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
                                onClick={handleInviteUsers}
                                className={`px-4 py-2 text-white font-medium rounded-lg duration-150 ${isCreateDisabled ? 'bg-gray-400' : 'bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111]'}`}
                                disabled={isCreateDisabled}
                            >
                                {t('Invite')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Synopsis;