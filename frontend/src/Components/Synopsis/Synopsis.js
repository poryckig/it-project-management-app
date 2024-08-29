import React from 'react';
import { useOutletContext } from 'react-router-dom';

const Synopsis = () => {
    const { project } = useOutletContext();

    if (!project) {
        return <div>Loading...</div>;
    }

    const members = project.members || [];
    const description = project.description || 'Brak opisu projektu';

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4">{project.name}</h2>
            <p className="text-lg mb-6">{description}</p>
            <h3 className="text-xl font-semibold mb-2">Członkowie projektu ({members.length}):</h3>
            <ul className="list-disc pl-6">
                {members.length > 0 ? (
                    members.map(member => (
                        <li key={member.id} className="text-md mb-2">
                            {member.username} {member.id === project.managedById ? '(Kierownik projektu)' : ''}
                        </li>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">Brak członków projektu.</p>
                )}
            </ul>
        </div>
    );
};

export default Synopsis;
