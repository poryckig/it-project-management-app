import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RegisterComponent = () => {
    const { t } = useTranslation();
    const { handleRegister } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
        const data = await handleRegister(username, password);
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <main className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 sm:px-4">
        <div className="w-full space-y-6 text-gray-600 sm:max-w-md">
          <div className="text-center">
            <div className="mt-5 space-y-2">
              <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">
                {t('Create an account')}
              </h3>
              <p>
                {t('Already have an account?')}{' '}
                <a
                  href="/"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  {t('Sign in')}
                </a>
              </p>
            </div>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div onSubmit={handleSubmit} className="bg-white shadow p-4 py-6 sm:p-6 sm:rounded-lg">
            <form className="space-y-5">
              <div>
                <label htmlFor="username" className="font-medium">{t('Username')}</label>
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="font-medium">{t('Password')}</label>
                <div className="relative w-full">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600"
                    style={{ zIndex: 10 }}
                  >
                    👁️
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-x-3">
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
              >
                {t('Create an account')}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  };
  
  export default RegisterComponent;