import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'http://localhost:3000/api/v1';

const ProjectDetails = () => {
    const { t } = useTranslation();
    const { projectId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const fetchProjectDetails = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/projects/${projectId}`, {
                withCredentials: true,
            });
            const projectData = response.data;

            const members = projectData.members.filter(member => member.id !== projectData.managedBy.id);
            projectData.members = [projectData.managedBy, ...members];

            setProject(projectData);

            const userResponse = await axios.get(`${BASE_URL}/profile`, {
                withCredentials: true,
            });
            setUser(userResponse.data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectDetails();
    }, [fetchProjectDetails]);

    useEffect(() => {
        fetchProjectDetails();
    }, [location.pathname, fetchProjectDetails]);

    const updateProject = async (key, value) => {
        try {
            if (!project || !project.members) {
                throw new Error('Project or members data is missing');
            }

            console.log(`Updating project with id: ${project.id}, key: ${key}, value: ${value}`);
    
            const response = await axios.put(`${BASE_URL}/projects/${project.id}`, {
                [key]: value,
                members: project.members.map(member => ({ id: member.id })),
            }, {
                withCredentials: true,
            });
    
            setProject(response.data);
        } catch (error) {
            console.error('Failed to update project', error);
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };

    const deleteProject = async () => {
        try {
            await axios.delete(`${BASE_URL}/projects/${projectId}`, {
                withCredentials: true,
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to delete project', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    const isProjectManager = user && project.managedBy && user.id === project.managedBy.id;

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <nav className="w-64 h-full bg-white p-4">
                <ul>
                    <li className="mb-4">
                        <NavLink
                            to="synopsis"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                            end
                        >
                            {t('General information')}
                        </NavLink>
                    </li>
                    <li className="mb-4">
                        <NavLink
                            to="case-study"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                        >
                            {t('Case study')}
                        </NavLink>
                    </li>
                    <li className="mb-4">
                        <NavLink
                            to="statut"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                        >
                            {t('Project statutes')}
                        </NavLink>
                    </li>
                    <li className="mb-4">
                        <NavLink 
                            to="zadania"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                        >
                            {t('Tasks')}
                        </NavLink>
                    </li>
                    <li className="mb-4">
                        <NavLink
                            to="ram"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                        >
                            {t('RAM matrix')}
                        </NavLink>
                    </li>
                    {isProjectManager && (
                        <>
                            <hr className="my-4 border-t border-gray-300" />
                            <li className="mb-4">
                                <NavLink
                                    to="ustawienia"
                                    className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                                >
                                    {t('Project settings')}
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            {/* Main Content */}
            <div className="flex-grow p-8 bg-gray-100 overflow-auto">
                <Outlet context={{ project, updateProject, setProject, user, deleteProject, showDeleteConfirmation, setShowDeleteConfirmation }} />
            </div>
        </div>
    );
};

export default ProjectDetails;