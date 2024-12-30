import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

const ProjectStatutes = () => {
    const { t } = useTranslation();

    const defaultSections = [
        { title: t('Problem description'), content: '', charsLeft: 10000 },
        { title: t('Description of the main project goal'), content: '', charsLeft: 10000 },
        { title: t('Description of sub-goals'), content: '', charsLeft: 10000 },
        { title: t('Description of success criteria'), content: '', charsLeft: 10000 },
        { title: t('Description of doubts, risks and obstacles'), content: '', charsLeft: 10000 },
    ];

    const { user } = useAuth();
    const { project, updateProject, setProject } = useOutletContext();

    const [sections, setSections] = useState(() => {
        return Array.isArray(project.projectStatutes?.content) ? project.projectStatutes.content.map(section => ({
            ...section,
            charsLeft: 10000 - section.content.length
        })) : defaultSections;
    });
    const [version, setVersion] = useState(project.projectStatutes?.version || '0.0.1');
    const [lastModified, setLastModified] = useState(project.projectStatutes?.lastModified || '');
    const [modifiedBy, setModifiedBy] = useState(project.projectStatutes?.modifiedBy || '');
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setSections(Array.isArray(project.projectStatutes?.content) ? project.projectStatutes.content.map(section => ({
            ...section,
            charsLeft: 10000 - section.content.length
        })) : defaultSections);
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
            setError(t('You must increase the version number before saving.'));
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
        if (field === 'content') {
            updatedSections[index].charsLeft = 10000 - value.length;
        }
        setSections(updatedSections);
    };

    const addSection = () => {
        setSections([...sections, { title: '', content: '', charsLeft: 10000 }]);
    };

    const removeSection = (index) => {
        const updatedSections = sections.filter((_, i) => i !== index);
        setSections(updatedSections);
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-4">{t('Project statutes')}</h2>
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <label className="block text-lg">{t('Version')}</label>
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
                            {t('Save')}
                        </button>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                        >
                            {t('Edit')}
                        </button>
                    )}
                </div>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {sections.map((section, index) => (
                <div key={index} className="mb-6">
                    {isEditing ? (
                        <>
                            <div className="flex items-center mb-2">
                                <span className="mr-2">{index + 1}.</span>
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                    className="block w-full border p-1"
                                />
                            </div>
                            <textarea
                                value={section.content}
                                onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                                maxLength={10000}
                                className="w-full h-32 border p-2"
                            />
                            <p className="text-sm text-gray-500">{t('Characters left')}: {section.charsLeft}</p>
                            <button onClick={() => removeSection(index)} className="text-red-500 mt-2">{t('Delete section')}</button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-semibold">{index + 1}. {section.title}</h3>
                            <p>{section.content}</p>
                        </>
                    )}
                    {index < sections.length - 1 && <hr className="my-4" />}
                </div>
            ))}

            {isEditing && (
                <button onClick={addSection} className="text-blue-500 mt-4">{t('Add new section')}</button>
            )}

            {lastModified && (
                <p className="italic mt-9">
                    {t('Last modified')} {formatDate(lastModified)} {t('by')}: {modifiedBy}
                </p>
            )}
        </div>
    );
};

export default ProjectStatutes;