import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import avatar from '../../img/avatar-placeholder.png';

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

 export default ProfileDropDown; 