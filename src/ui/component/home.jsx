// src/ui/Home.jsx
import React, { useState } from "react";
import AddComponent from "./addComponent";
import AddMachine from "./addMachine";
import WeeklyMachineSchedule from "../WeeklyMachineSchedule";

function Home() {
  const [view, setView] = useState("home");
  const goBack = () => setView("home");

  return (
    <div className='home-container'>
      {view === "home" ? (
        <div className='home-header'>
          <button
            className='home-button'
            onClick={() => setView("addComponent")}
          >
            Add Component
          </button>
          <button className='home-button' onClick={() => setView("addMachine")}>
            Add Machine
          </button>
          {/* <button className='home-button' onClick={() => setView("Scheduled")}>
            Scheduled
          </button> */}
        </div>
      ) : (
        <button className='home-button' onClick={goBack}>
          ⬅️ Back
        </button>
      )}

      <div className='home-content'>
        {view === "home" && <div>Home Page</div>}
        {view === "addComponent" && <AddComponent />}
        {view === "addMachine" && <AddMachine />}
        {/* {view === "Scheduled" && <WeeklyMachineSchedule />} */}
      </div>
    </div>
  );
}

export default Home;
