import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProjectSettings = () => {
    const { t } = useTranslation();
    const { project, updateProject, deleteProject, showDeleteConfirmation, setShowDeleteConfirmation, setProject } = useOutletContext();
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleSave = async () => {
        await updateProject('name', name);
        await updateProject('description', description);
        setProject(prevProject => ({ ...prevProject, name, description }));
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = async () => {
        await deleteProject();
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    return (
        <div className="container mx-auto p-6 bg-white rounded shadow-lg">
            <div className="flex justify-center items-center mt-6 mb-6">
                <h2 className="text-3xl font-bold">{t('Project settings')}</h2>
            </div>
            <div className="mt-9 mb-4">
                <label className="block font-medium mb-2">{t('Project name')}</label>
                <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className="border rounded w-full px-3 py-2"
                />
            </div>
            <div className="mb-4">
                <label className="block font-medium mb-2">{t('Project description')}</label>
                <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    className="border rounded w-full px-3 py-2"
                />
            </div>
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                >
                    {t('Save')}
                </button>
            </div>
            <div className="mt-8">
                <button
                    onClick={handleDeleteClick}
                    className="px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                >
                    {t('Delete project')}
                </button>
            </div>

            {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl text-center font-bold mb-4">{t('Are you sure you want to delete the project?')}</h2>
                        <div className="flex justify-center mt-5">
                            <button
                                onClick={handleCancelDelete}
                                className="mr-4 px-4 py-2 text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 rounded-lg duration-150"
                            >
                                {t('No')}
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
                            >
                                {t('Yes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSettings;