import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

const RAMatrix = () => {
    const { project, updateProject } = useOutletContext();
    const [tasks, setTasks] = useState([]);
    const members = project.members || [];
    const [matrix, setMatrix] = useState([]);
    const [editingCell, setEditingCell] = useState(null);
    const navigate = useNavigate();
    const sortOrder = localStorage.getItem('taskSortOrder') || 'desc';

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/projects/${project.id}/tasks`, {
                    withCredentials: true,
                });
                const sortedTasks = response.data.sort((a, b) => sortOrder === 'asc' ? new Date(a.lastChange) - new Date(b.lastChange) : new Date(b.lastChange) - new Date(a.lastChange));
                setTasks(sortedTasks);
            } catch (error) {
                console.error('Failed to fetch tasks', error);
            }
        };

        fetchTasks();
    }, [project.id, sortOrder]);

    useEffect(() => {
        if (project.ramMatrix) {
            setMatrix(project.ramMatrix);
        } else {
            const initialMatrix = tasks.map(task => {
                const row = ['', ...new Array(members.length).fill('P')];
                const assigneeIndex = members.findIndex(member => member.id === task.assigneeId);
                if (assigneeIndex !== -1) {
                    row[assigneeIndex + 1] = 'O';
                }
                task.approvers.forEach(approver => {
                    const approverIndex = members.findIndex(member => member.id === approver.id);
                    if (approverIndex !== -1) {
                        row[approverIndex + 1] = 'Z';
                    }
                });
                task.informed.forEach(informed => {
                    const informedIndex = members.findIndex(member => member.id === informed.id);
                    if (informedIndex !== -1) {
                        row[informedIndex + 1] = 'P';
                    }
                });
                return row;
            });
            setMatrix(initialMatrix);
        }
    }, [project.ramMatrix, tasks, members.length]);

    const handleCellChange = (rowIndex, colIndex, value) => {
        const newMatrix = [...matrix];
        newMatrix[rowIndex][colIndex] = value;
        setMatrix(newMatrix);
    };

    const handleAddRow = () => {
        setMatrix([...matrix, ['', ...new Array(members.length).fill('P')]]);
    };

    const handleSave = async () => {
        try {
            await axios.put(`${BASE_URL}/projects/${project.id}`, {
                ramMatrix: matrix,
            }, {
                withCredentials: true,
            });
            updateProject('ramMatrix', matrix);
        } catch (error) {
            console.error('Failed to save RAM matrix', error);
        }
    };

    const handleTaskClick = (taskId) => {
        navigate(`/projects/${project.id}/tasks/${taskId}`);
    };

    const handleCellClick = (rowIndex, colIndex) => {
        if (matrix[rowIndex][colIndex] !== 'O') {
            setEditingCell({ rowIndex, colIndex });
        }
    };

    const handleCellBlur = () => {
        setEditingCell(null);
    };

    const handleCellValueChange = async (rowIndex, colIndex, value) => {
        const newMatrix = [...matrix];
        const currentOIndex = newMatrix[rowIndex].indexOf('O');

        if (value === 'O' && currentOIndex !== -1 && currentOIndex !== colIndex) {
            newMatrix[rowIndex][currentOIndex] = 'P';
        }

        newMatrix[rowIndex][colIndex] = value;
        setMatrix(newMatrix);
        setEditingCell(null);

        const task = tasks[rowIndex];
        const assigneeId = newMatrix[rowIndex].indexOf('O') !== -1 ? members[newMatrix[rowIndex].indexOf('O') - 1].id : null;
        const approvers = newMatrix[rowIndex].reduce((acc, cell, index) => {
            if (cell === 'Z') {
                acc.push(members[index - 1].id);
            }
            return acc;
        }, []);
        const informed = newMatrix[rowIndex].reduce((acc, cell, index) => {
            if (cell === 'P') {
                acc.push(members[index - 1].id);
            }
            return acc;
        }, []);

        await updateTaskRoles(task.id, assigneeId, approvers, informed);

        await handleSave();
    };

    const updateTaskRoles = async (taskId, assigneeId, approvers, informed) => {
        try {
            await axios.put(`${BASE_URL}/projects/${project.id}/tasks/${taskId}`, {
                assigneeId,
                approvers,
                informed,
            }, {
                withCredentials: true,
            });
        } catch (error) {
            console.error('Failed to update task roles', error);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded shadow-lg">
            <div className="flex justify-center items-center mt-6 mb-6">
                <h2 className="text-3xl font-bold">Macierz RAM</h2>
            </div>
            <div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2"></th>
                            {members.map((member) => (
                                <th key={member.id} className="border text-center px-4 py-2">{member.username}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, rowIndex) => (
                            <tr key={task.id}>
                                <td className="border px-4 py-2 cursor-pointer" onClick={() => handleTaskClick(task.id)}>
                                    <div className="flex items-center hover:text-[#551111]">
                                        <div className="flex items-center justify-center border-r pr-4 mr-3 w-6 h-6">{task.id}</div>
                                        <span>{task.name}</span>
                                    </div>
                                </td>
                                {members.map((member, colIndex) => (
                                    <td key={colIndex} className="border text-center px-4 py-2 cursor-pointer" onClick={() => handleCellClick(rowIndex, colIndex + 1)}>
                                        {editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex + 1 ? (
                                            <select
                                                value={matrix[rowIndex] && matrix[rowIndex][colIndex + 1] ? matrix[rowIndex][colIndex + 1] : ''}
                                                onChange={(e) => handleCellValueChange(rowIndex, colIndex + 1, e.target.value)}
                                                onBlur={handleCellBlur}
                                                autoFocus
                                                className="text-center"
                                            >
                                                {matrix[rowIndex][colIndex + 1] !== 'O' && <option value="O">O</option>}
                                                <option value="Z">Z</option>
                                                <option value="P">P</option>
                                            </select>
                                        ) : (
                                            matrix[rowIndex] && matrix[rowIndex][colIndex + 1] ? matrix[rowIndex][colIndex + 1] : ''
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="mt-9 text-sm text-gray-500">O - Odpowiedzialny, Z - Zatwierdzający, P - Poinformowany</p>
            </div>
        </div>
    );
};

export default RAMatrix;