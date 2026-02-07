import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, login, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" style={{ textDecoration: 'none' }}>
        <div className="logo-icon"></div>
        <span>LuminaAI</span>
      </Link>
      <div className="navbar-links">
        <Link to="/assessments">Assessments</Link>
        <Link to="/learning-plans">Learning Plans</Link>
        <Link to="/progress">Progress</Link>
        <Link to="/ai-assistant">AI Assistant</Link>
      </div>
      <div className="navbar-actions">
        {user ? (
          <div className="user-profile">
            <img src={user.picture} alt={user.name} className="user-avatar" referrerPolicy="no-referrer" />
            <span className="user-name">{user.given_name}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        ) : (
          <div className="google-login-wrapper">
             <GoogleLogin
                onSuccess={login}
                onError={() => {
                  console.log('Login Failed');
                }}
                theme="filled_black"
                shape="pill"
              />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
