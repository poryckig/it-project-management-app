import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import UserPhoto from './UserPhoto/UserPhoto';
import UserInfo from './UserInfo/UserInfo';
import { useTranslation } from 'react-i18next';
import avatar from '../../img/avatar-placeholder.png';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const registeredAt = format(new Date(user.registeredAt), 'dd-MM-yyyy HH:mm:ss');

  return (
    <div className="profile-container">
      <div className="header-menu-container">
        <div className="header-menu">
          <div className="user-profile-info">
            <UserPhoto photo={user && user.image ? user.image : avatar} />
            <UserInfo label={t('Username')} value={user ? user.username : ''} />
            <UserInfo label={t('Join Date')} value={registeredAt} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;