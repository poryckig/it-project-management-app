import React from 'react';

const userPhotoStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: '20px',
};

function UserPhoto({ photo }) {
  return <img src={photo} alt="Użytkownik" style={userPhotoStyle} />;
}

export default UserPhoto;