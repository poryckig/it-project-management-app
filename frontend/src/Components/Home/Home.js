import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Witaj {user?.username}!</h1>
        </div>
    );    
};

export default Home;
