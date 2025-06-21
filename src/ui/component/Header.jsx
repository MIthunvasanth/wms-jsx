import React from "react";
import "./Header.css";

const Logo = () => (
  <img
    src="https://i.imgur.com/gC4sHqG.png" // A sleek, abstract WMS logo
    alt="LogiSync WMS Logo"
    className="logo"
  />
);

function Header({ activeTab, setActiveTab }) {
  const tabs = ["Home", "Order", "Plan", "Master"];

  return (
    <header className="header">
      <div className="header-top-row">
        <div className="header-logo">
          <Logo />
        </div>
        <div className="header-company-name">
          <h1>LogiSync WMS</h1>
        </div>
      </div>
      <nav className="header-nav-row">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Header;
