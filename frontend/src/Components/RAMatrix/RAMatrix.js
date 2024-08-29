import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const RAMatrix = () => {
    const { project, updateProject } = useOutletContext();

    const members = project.members || [];
    const [matrix, setMatrix] = useState(project.ramMatrix || []);
    const [isEditing, setIsEditing] = useState(false);

    const handleCellChange = (rowIndex, colIndex, value) => {
        const newMatrix = [...matrix];
        newMatrix[rowIndex][colIndex] = value;
        setMatrix(newMatrix);
    };

    const handleAddRow = () => {
        setMatrix([...matrix, ['', ...new Array(members.length).fill('')]]);
    };

    const handleSave = () => {
        updateProject('ramMatrix', matrix);
        setIsEditing(false);
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h2 className="text-3xl font-bold text-center mb-4">Macierz RAM</h2>
            {isEditing ? (
                <div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2"></th>
                                {members.map((member) => (
                                    <th key={member.id} className="border px-4 py-2">{member.username}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="border px-4 py-2">
                                        <input
                                            value={row[0]}
                                            onChange={(e) => handleCellChange(rowIndex, 0, e.target.value)}
                                            className="w-full"
                                        />
                                    </td>
                                    {row.slice(1).map((cell, colIndex) => (
                                        <td key={colIndex + 1} className="border px-4 py-2">
                                            <select
                                                value={cell}
                                                onChange={(e) => handleCellChange(rowIndex, colIndex + 1, e.target.value)}
                                            >
                                                <option value="">--</option>
                                                <option value="O">O</option>
                                                <option value="P">P</option>
                                                <option value="Z">Z</option>
                                            </select>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button
                        onClick={handleAddRow}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Dodaj zadanie
                    </button>
                    <button
                        onClick={handleSave}
                        className="mt-4 ml-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Zapisz
                    </button>
                    <p className="mt-4 text-sm text-gray-500">O - Odpowiedzialny, P - Poinformowany, Z - Zatwierdzający</p>
                </div>
            ) : (
                <div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2"></th>
                                {members.map((member) => (
                                    <th key={member.id} className="border px-4 py-2">{member.username}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {matrix.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="border px-4 py-2">{row[0]}</td>
                                    {row.slice(1).map((cell, colIndex) => (
                                        <td key={colIndex + 1} className="border px-4 py-2">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-4 text-sm text-gray-500">O - Odpowiedzialny, P - Poinformowany, Z - Zatwierdzający</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                    >
                        Edytuj
                    </button>
                </div>
            )}
        </div>
    );
};

export default RAMatrix;
