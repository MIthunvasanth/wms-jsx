import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddMachine from "./component/addMachine";
import AddComponent from "./component/addComponent";
import CompanyList from "./component/Comapnylist";
import WeeklyMachineSchedule from "./WeeklyMachineSchedule";
function App() {
  return (
    <Router>
      <div className='App'>
        <Header />
        <div className='right-section'>
          <Sidebar />
          <div className='main-content'>
            <Routes>
              <Route path='/add-machine' element={<AddMachine />} />
              <Route path='/add-machine/:id' element={<AddMachine />} />
              <Route path='/add-component' element={<AddComponent />} />
              <Route path='/list-comapany' element={<CompanyList />} />
              <Route
                path='/machine-schedule/:id'
                element={<WeeklyMachineSchedule />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

function Sidebar() {
  return (
    <div className='sidebar'>
      <h2>PROCESS SCHEDULER</h2>
      <Link to='/add-machine' className='sidebar-link'>
        ADD PROCESS
      </Link>
      <Link to='/list-comapany' className='sidebar-link'>
        PROCESS LIST
      </Link>
      <Link to='/machine-schedule' className='sidebar-link'>
        Schedule
      </Link>
    </div>
  );
}

function Header() {
  return (
    <div className='header'>
      <button
        className='header-button'
        onClick={() => window.electron.sendFrameAction("MINIMIZE")}
      >
        _
      </button>
      <button
        className='header-button'
        onClick={() => window.electron.sendFrameAction("MAXIMIZE")}
      >
        □
      </button>
      <button
        className='header-button'
        onClick={() => window.electron.sendFrameAction("CLOSE")}
      >
        ✕
      </button>
    </div>
  );
}

export default App;
