import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import avatar from '../../img/avatar-placeholder.png';
import enFlag from '../../img/flags/uk-flag.png';
import plFlag from '../../img/flags/pl-flag.png';

const ProfileDropDown = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef();
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const handleSubmitLogout = () => {
    handleLogout();
    navigate('/');
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${props.class}`} ref={profileRef}>
      <button
        className="w-8 h-8 outline-none rounded-full ring-offset-2 ring-gray-200 ring-2 focus:ring-[#6A1515]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={avatar}
          alt={user ? user.username : 'User'}
          className="w-full h-full rounded-full"
        />
      </button>
      {isOpen && (
        <ul className="absolute bg-white mt-2 py-1 w-48 border rounded-md shadow-lg right-0 profile-dropdown">
          <li>
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              {'Profil'}
            </Link>
          </li>
          <li>
            <button
              onClick={handleSubmitLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {'Wyloguj'}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="text-gray-700 hover:text-gray-900">
        {'Zmień język'}
      </button>
      {isOpen && (
        <div className="absolute right-0 bg-white mt-2 py-1 w-48 border rounded-md shadow-lg">
          <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
            <img src={enFlag} alt="English" className="w-6" />
            {'Angielski'}
          </div>
          <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer">
            <img src={plFlag} alt="Polski" className="w-6" />
            {'Polski'}
          </div>
        </div>
      )}
    </div>
  );
};

const NavbarComponent = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="flex items-center justify-between py-3 px-4 max-w-screen-xl mx-auto md:px-8">
        <div className="flex items-center">
          {user && (
            <a href="/" className="mr-4 text-gray-900 hover:text-gray-900 font-normal">
              Home
            </a>
          )}
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          <LanguageSwitcher />
          {user && <ProfileDropDown />}
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;