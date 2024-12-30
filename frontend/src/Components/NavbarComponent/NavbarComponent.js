import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileDropDown from './ProfileDropDown';
import { useTranslation } from "react-i18next";

const BASE_URL = 'http://localhost:3000/api/v1';

const NavbarComponent = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleNotificationClick = async (notification) => {
    const projectInvitationId = notification.projectInvitationId;
    if (projectInvitationId) {
      try {
        const response = await axios.get(`${BASE_URL}/invitations/${projectInvitationId}`, { withCredentials: true });
        const projectInvitation = response.data;
        setSelectedNotification({ ...notification, projectInvitation });
      } catch (error) {
        console.error('Failed to fetch project invitation:', error);
      }
    } else {
      setSelectedNotification(notification);
    }
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
    if (!selectedNotification?.projectInvitation) return;

    try {
      await axios.post(`${BASE_URL}/invitations/${selectedNotification.projectInvitation.id}/respond`, {
        response: 'accept',
      }, { withCredentials: true });

      // Remove notification
      await axios.delete(`${BASE_URL}/notifications/${selectedNotification.id}`, { withCredentials: true });
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setSelectedNotification(null);
    } catch (error) {
      console.error('Failed to accept invitation', error);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!selectedNotification?.projectInvitation) return;

    try {
      await axios.post(`${BASE_URL}/invitations/${selectedNotification.projectInvitation.id}/respond`, {
        response: 'decline',
      }, { withCredentials: true });

      await axios.delete(`${BASE_URL}/notifications/${selectedNotification.id}`, { withCredentials: true });
      setNotifications(notifications.filter(n => n.id !== selectedNotification.id));
      setSelectedNotification(null);  // No need for a window
    } catch (error) {
      console.error('Failed to decline invitation', error);
    }
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white p-4 rounded shadow-lg w-1/3 relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="absolute top-0 right-0 mt-2 mr-2 text-gray-700 hover:text-gray-900 text-lg"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
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
            {t('Home')}
          </Link>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          {user && (
            <div className="relative" ref={notificationsRef}>
              <button
                className="text-gray-700 hover:text-gray-900"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {t('Notifications')} ({notifications.length})
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
    </nav>
  );
};

export default NavbarComponent;