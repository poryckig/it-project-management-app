import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const location = useLocation();
    const [project, setProject] = useState(null);
    const [user, setUser] = useState(null); // State to hold the user data
    const [loading, setLoading] = useState(true);

    const fetchProjectDetails = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/projects/${projectId}`, {
                withCredentials: true,
            });
            setProject(response.data);

            // Fetch user information
            const userResponse = await axios.get(`${BASE_URL}/profile`, {
                withCredentials: true,
            });
            setUser(userResponse.data);
        } catch (error) {
            console.error('Failed to fetch project details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    useEffect(() => {
        fetchProjectDetails();
    }, [location.pathname]);

    const updateProject = async (key, value) => {
        try {
            console.log(`Updating project with id: ${project.id}, key: ${key}, value: ${value}`);
    
            const response = await axios.put(`${BASE_URL}/projects/${project.id}`, {
                [key]: value,
            }, {
                withCredentials: true,
            });
    
            // Assuming the response returns the updated project
            setProject(response.data);
        } catch (error) {
            console.error('Failed to update project', error);
            console.error('Error details:', error.response ? error.response.data : error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    return (
        <div className="flex">
            {/* Sidebar */}
            <nav className="w-64 h-screen bg-white p-4">
                <ul>
                    <li className="mb-4">
                        <NavLink
                            to="synopsis"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                            end
                        >
                            Ogólne informacje
                        </NavLink>
                    </li>
                    <li className="mb-4">
                        <NavLink
                            to="case-study"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                        >
                            Case study
                        </NavLink>
                    </li>
                    <li className="mb-4">
                        <NavLink
                            to="statut"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                        >
                            Statut projektu
                        </NavLink>
                    </li>
                    <li className="mb-4">
                        <NavLink
                            to="ram"
                            className={({ isActive }) => isActive ? 'text-blue-500' : 'text-white'}
                        >
                            Macierz RAM
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* Main Content */}
            <div className="flex-grow p-8 bg-gray-100">
                <Outlet context={{ project, updateProject, setProject, user }} />
            </div>
        </div>
    );
};

export default ProjectDetails;
