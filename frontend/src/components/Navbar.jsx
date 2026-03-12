import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/clerk-react";
import "./Navbar.css";

const Navbar = ({ theme, onToggleTheme }) => {
  const { pathname } = useLocation();

  const links = [
    { to: "/assessments", label: "Assessments" },
    { to: "/learning-plans", label: "Learning Plans" },
    { to: "/progress", label: "Progress" },
    { to: "/ai-assistant", label: "AI Assistant" },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" style={{ textDecoration: "none" }}>
        <img src="/logo.png" alt="LearnPath AI" className="logo-icon" />
        <span className="brand-gradient">LearnPath AI</span>
      </Link>

      <div className="navbar-links">
        {links.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${pathname === to ? "active" : ""}`}
          >
            {label}
            {pathname === to && <span className="nav-dot" />}
          </Link>
        ))}
      </div>

      <div className="navbar-actions">
        <button className="theme-toggle" onClick={onToggleTheme} type="button" aria-label="Toggle theme">
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </button>

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
