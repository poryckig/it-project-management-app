import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

const Home = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false); 
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [isCreateDisabled, setIsCreateDisabled] = useState(true);
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

    const handleCreateProject = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/projects`, {
                name: newProjectName,
                description: newProjectDescription
            }, {
                withCredentials: true
            });
            setProjects([...projects, response.data]);
            setNewProjectName('');
            setNewProjectDescription('');
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
    };

    const handleProjectClick = (projectId) => {
        navigate(`/projects/${projectId}/synopsis`);
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mt-6">
                <h1 className="text-3xl font-bold">Projekty</h1>
                <input
                    type="text"
                    placeholder="Filter projects"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded px-3 py-1"
                />
                <button
                    onClick={handleOpenDialog}
                    className="ml-4 px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                >
                    + Stwórz projekt
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="p-4 border rounded bg-white cursor-pointer h-48" // Fixed height
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <h2 className="text-2xl font-bold">{project.name}</h2>
                            <p>{project.description}</p>
                            <p className="text-sm text-gray-500">
                                Kierownik: {project.managedBy ? project.managedBy.username : "Brak kierownika"}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>Brak projektów.</p>
                )}
            </div>

            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Stwórz nowy projekt</h2>
                        <input
                            type="text"
                            placeholder="Nazwa projektu*"
                            value={newProjectName}
                            onChange={handleProjectNameChange}
                            className="border rounded w-full px-3 py-2 mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Opis"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            className="border rounded w-full px-3 py-2 mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleCloseDialog}
                                className="mr-2 px-4 py-2 text-gray-700 border border-gray-300 font-medium rounded-lg duration-150"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleCreateProject}
                                className={`px-4 py-2 text-white font-medium rounded-lg duration-150 ${isCreateDisabled ? 'bg-gray-400' : 'bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111]'}`}
                                disabled={isCreateDisabled}
                            >
                                Stwórz
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
