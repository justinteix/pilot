import React from 'react';
import UserProfile from './UserProfile';

// This component now just redirects to the UserProfile component
// for the current user's profile
const Profile = () => {
  return <UserProfile />;
};

export default Profile;