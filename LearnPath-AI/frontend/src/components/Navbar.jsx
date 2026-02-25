import React from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" style={{ textDecoration: "none" }}>
        <div className="logo-icon"></div>
        <span>LuminaAI</span>
      </Link>
      <div className="navbar-links">
        <Link to="/assessments">Assessments</Link>
        <Link to="/learning-plans">Learning Plans</Link>
        <Link to="/progress">Progress</Link>
        <Link to="/ai-assistant">AI Assistant</Link>
      </div>
<<<<<<< HEAD
      <div className="navbar-actions">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-signin">Sign In</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
