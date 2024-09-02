import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileDropDown from './ProfileDropDown';

const BASE_URL = 'http://localhost:3000/api/v1';

const NavbarComponent = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); 
  const notificationsRef = useRef();

  useEffect(() => {
    if (user) {
      axios.get(`${BASE_URL}/notifications`, { withCredentials: true })
        .then(response => setNotifications(response.data))
        .catch(error => console.error('Failed to fetch notifications', error));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/notifications/${id}`, { withCredentials: true });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const handleAcceptInvitation = async () => {
    try {
      await axios.post(`${BASE_URL}/invitations/${selectedNotification.projectId}/respond`, { response: 'accept' }, { withCredentials: true });
      setSuccessMessage(`You have joined the project ${selectedNotification.project.name}.`);
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setSelectedNotification(null);
    } catch (error) {
      console.error('Failed to accept invitation:', error.response?.data);
    }
  };

  const handleDeclineInvitation = async () => {
    try {
      await axios.post(`${BASE_URL}/invitations/${selectedNotification.projectId}/respond`, { response: 'decline' }, { withCredentials: true });
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setSelectedNotification(null);
    } catch (error) {
      console.error('Failed to decline invitation:', error.response?.data);
    }
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded shadow-lg w-1/3 relative">
          <button
            className="absolute top-0 right-0 mt-2 mr-2 text-gray-700 hover:text-gray-900 text-lg"
            onClick={onClose}
          >
            &#x2716;
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <nav className="bg-white border-b">
      <div className="flex items-center justify-between py-3 px-4 max-w-screen-xl mx-auto md:px-8">
        <div className="flex items-center">
          <Link to="/" className="mr-4 text-gray-900 hover:text-gray-900 font-normal">
            Home
          </Link>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          {user && (
            <div className="relative" ref={notificationsRef}>
              <button
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                Powiadomienia ({notifications.length})
              </button>
              {showNotifications && notifications.length > 0 && (
                <div className="absolute mt-2 w-64 bg-white shadow-lg border rounded-md">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex justify-between items-center relative"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span>{notification.content}</span>
                      <button
                        className="text-red-500 hover:text-red-700 text-lg absolute top-2 right-1 mt-1 mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        &#x2716;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <LanguageSwitcher />
          {user && <ProfileDropDown />}
        </div>
      </div>
      <Modal isOpen={!!selectedNotification} onClose={() => setSelectedNotification(null)}>
        {selectedNotification && (
          <div>
            <p>{selectedNotification.content}</p>
            <div className="mt-4 flex justify-between">
              {selectedNotification.content.includes('invited') && (
                <>
                  <button
                    className="text-white font-medium px-4 py-2 rounded bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] w-1/2 mr-2"
                    onClick={handleAcceptInvitation}
                  >
                    Akceptuj
                  </button>
                  <button
                    className="bg-gray-300 text-gray-900 font-normal px-4 py-2 rounded hover:bg-gray-400 w-1/2"
                    onClick={handleDeclineInvitation}
                  >
                    Odrzuć
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={!!successMessage} onClose={() => setSuccessMessage('')}>
        <div>
          <p>{successMessage}</p>
          <button
            className="mt-4 px-4 py-2 text-white font-medium bg-[#6A1515] hover:bg-[#551111] active:bg-[#551111] rounded-lg duration-150"
            onClick={() => setSuccessMessage('')}
          >
            OK
          </button>
        </div>
      </Modal>
    </nav>
  );
};

export default NavbarComponent;
