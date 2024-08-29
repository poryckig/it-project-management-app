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

const CaseStudy = () => {
    const { user } = useAuth();
    const { project, updateProject, setProject } = useOutletContext();

    const [content, setContent] = useState(project.caseStudy?.content || '');
    const [version, setVersion] = useState(project.caseStudy?.version || '0.0.1');
    const [lastModified, setLastModified] = useState(project.caseStudy?.lastModified || '');
    const [modifiedBy, setModifiedBy] = useState(project.caseStudy?.modifiedBy || '');
    const [isEditing, setIsEditing] = useState(false);
    const [charsLeft, setCharsLeft] = useState(10000 - content.length);
    const [error, setError] = useState('');

    useEffect(() => {
        setContent(project.caseStudy?.content || '');
        setVersion(project.caseStudy?.version || '0.0.1');
        setLastModified(project.caseStudy?.lastModified || '');
        setModifiedBy(project.caseStudy?.modifiedBy || '');
    }, [project]);

    useEffect(() => {
        if (isEditing) setError('');
    }, [isEditing]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!compareVersions(project.caseStudy?.version || '0.0.0', version)) {
            setError('You must increase the version number before saving.');
            return;
        }

        if (updateProject) {
            const updatedCaseStudy = { 
                content, 
                version, 
                lastModified: new Date().toISOString(), 
                modifiedBy: user?.username || 'Unknown' 
            };
            await updateProject('caseStudy', updatedCaseStudy);
            setIsEditing(false);

            setProject((prevProject) => ({
                ...prevProject,
                caseStudy: updatedCaseStudy,
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
        if (compareVersions(project.caseStudy?.version || '0.0.0', parts.join('.'))) {
            setError('');
        }
    };

    const getOptions = (currentValue, max) => {
        return Array.from({ length: max + 1 }, (_, i) => ({
            value: i,
            disabled: i < currentValue,
        }));
    };

    return (
        <div className="max-w-2xl mx-auto p-4 relative">
            <h2 className="text-3xl font-bold text-center mb-4">Case Study</h2>

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
                                {getOptions(project.caseStudy?.version.split('.')[0] || 0, 10).map(({ value }) => (
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

            {isEditing ? (
                <>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={10000}
                        className="w-full h-48 border p-2"
                    />
                </>
            ) : (
                <p>{content}</p>
            )}

            {isEditing && (
                <p className="text-sm text-gray-500">Pozostało znaków: {charsLeft}</p>
            )}

            {lastModified && (
                <p className="italic mt-4">
                    Ostatnia modyfikacja {formatDate(lastModified)} przez: {modifiedBy}
                </p>
            )}
        </div>
    );
};

export default CaseStudy;