import React from "react";
import "./WindowControls.css";

const WindowControls = () => (
  <div className="window-controls">
    <button
      className="window-control-button"
      onClick={() => window.electron.sendFrameAction("MINIMIZE")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
      >
        <path fill="currentColor" d="M20 14H4v-4h16"></path>
      </svg>
    </button>
    <button
      className="window-control-button"
      onClick={() => window.electron.sendFrameAction("MAXIMIZE")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
      >
        <path fill="currentColor" d="M4 4h16v16H4V4m2 2v12h12V6H6"></path>
      </svg>
    </button>
    <button
      className="window-control-button close"
      onClick={() => window.electron.sendFrameAction("CLOSE")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"
        ></path>
      </svg>
    </button>
  </div>
);

export default WindowControls;
