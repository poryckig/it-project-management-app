import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const formatDate = (dateString) => {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-GB', options).replace(/\//g, '-').replace(/,/, '');
};

const compareVersions = (currentVersion, newVersion) => {
    const current = currentVersion.split('.').map(Number);
    const next = newVersion.split('.').map(Number);

    for (let i = 0; i < current.length; i++) {
        if (next[i] > current[i]) return true;
        if (next[i] < current[i]) return false;
    }
    return false;
};

const defaultSections = [
    { title: 'Opis problemu', content: '' },
    { title: 'Opis głównego celu projektu', content: '' },
    { title: 'Opis celów cząstkowych', content: '' },
    { title: 'Opis kryteriów sukcesu', content: '' },
    { title: 'Opis wątpliwości, ryzyka i przeszkód', content: '' },
];

const ProjectStatutes = () => {
    const { user } = useAuth();
    const { project, updateProject, setProject } = useOutletContext();

    const [sections, setSections] = useState(() => {
        return Array.isArray(project.projectStatutes?.content) ? project.projectStatutes.content : defaultSections;
    });
    const [version, setVersion] = useState(project.projectStatutes?.version || '0.0.1');
    const [lastModified, setLastModified] = useState(project.projectStatutes?.lastModified || '');
    const [modifiedBy, setModifiedBy] = useState(project.projectStatutes?.modifiedBy || '');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setSections(Array.isArray(project.projectStatutes?.content) ? project.projectStatutes.content : defaultSections);
        setVersion(project.projectStatutes?.version || '0.0.1');
        setLastModified(project.projectStatutes?.lastModified || '');
        setModifiedBy(project.projectStatutes?.modifiedBy || '');
    }, [project]);

    useEffect(() => {
        if (isEditing) setError('');
    }, [isEditing]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!compareVersions(project.projectStatutes?.version || '0.0.0', version)) {
            setError('You must increase the version number before saving.');
            return;
        }

        if (updateProject) {
            const updatedProjectStatutes = { 
                content: sections, 
                version, 
                lastModified: new Date().toISOString(), 
                modifiedBy: user?.username || 'Unknown' 
            };
            await updateProject('projectStatutes', updatedProjectStatutes);
            setIsEditing(false);

            setProject((prevProject) => ({
                ...prevProject,
                projectStatutes: updatedProjectStatutes,
            }));
        } else {
            console.error('updateProject is not a function');
        }
    };

    const handleVersionChange = (e, position) => {
        const parts = version.split('.').map(Number);

        parts[position] = Number(e.target.value);

        if (position === 0) {
            parts[1] = 0;
            parts[2] = 0;
        } else if (position === 1) {
            parts[2] = 0;
        }

        setVersion(parts.join('.'));

        // Clear the error when a valid version is selected
        if (compareVersions(project.projectStatutes?.version || '0.0.0', parts.join('.'))) {
            setError('');
        }
    };

    const getOptions = (currentValue, max) => {
        return Array.from({ length: max + 1 }, (_, i) => ({
            value: i,
            disabled: i < currentValue,
        }));
    };

    const handleSectionChange = (index, field, value) => {
        const updatedSections = [...sections];
        updatedSections[index][field] = value;
        setSections(updatedSections);
    };

    const addSection = () => {
        setSections([...sections, { title: '', content: '' }]);
    };

    const removeSection = (index) => {
        const updatedSections = sections.filter((_, i) => i !== index);
        setSections(updatedSections);
    };

    return (
        <div className="max-w-2xl mx-auto p-4 relative">
            <h2 className="text-3xl font-bold text-center mb-4">Statut Projektu</h2>

            <div className="mb-4 flex justify-between items-center">
                <div>
                    <label className="block text-sm">Wersja</label>
                    {isEditing ? (
                        <div className="flex space-x-2">
                            <select
                                value={version.split('.')[0]}
                                onChange={(e) => handleVersionChange(e, 0)}
                                className="border p-1"
                            >
                                {getOptions(project.projectStatutes?.version.split('.')[0] || 0, 10).map(({ value }) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={version.split('.')[1]}
                                onChange={(e) => handleVersionChange(e, 1)}
                                className="border p-1"
                            >
                                {[...Array(10).keys()].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={version.split('.')[2]}
                                onChange={(e) => handleVersionChange(e, 2)}
                                className="border p-1"
                            >
                                {[...Array(10).keys()].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <p>{version}</p>
                    )}
                </div>

                <div className="p-4">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                        >
                            Zapisz
                        </button>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                        >
                            Edytuj
                        </button>
                    )}
                </div>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {sections.map((section, index) => (
                <div key={index} className="mb-4">
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                className="block w-full mb-2 border p-1"
                            />
                            <textarea
                                value={section.content}
                                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                                maxLength={10000}
                                className="w-full h-32 border p-2"
                            />
                            <button onClick={() => removeSection(index)} className="text-red-500 mt-2">Usuń sekcję</button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-semibold">{section.title}</h3>
                            <p>{section.content}</p>
                        </>
                    )}
                </div>
            ))}

            {isEditing && (
                <button onClick={addSection} className="text-blue-500 mt-4">Dodaj nową sekcję</button>
            )}

            {lastModified && (
                <p className="italic mt-4">
                    Ostatnia modyfikacja {formatDate(lastModified)} przez: {modifiedBy}
                </p>
            )}
        </div>
    );
};

export default ProjectStatutes;