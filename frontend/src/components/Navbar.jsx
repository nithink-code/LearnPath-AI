import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import "./Navbar.css";

const Navbar = ({ theme }) => {
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/assessments", label: "Assessments" },
    { to: "/learning-plans", label: "Learning Plans" },
    { to: "/progress", label: "Progress" },
    { to: "/ai-assistant", label: "AI Assistant" },
  ];

  return (
    <>
      <Link to="/" className="navbar-logo-corner" style={{ textDecoration: "none" }}>
        <img src="/logo.png" alt="LearnPath AI" className="logo-icon" />
        <span className="brand-gradient">LearnPath AI</span>
      </Link>

      <nav className="navbar-floating-pill">
        <div className="navbar-links">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${pathname === to ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="navbar-actions-corner">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-signin">Sign In</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </>
  );
};

export default Navbar;
