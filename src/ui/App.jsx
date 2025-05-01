import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AddMachine from "./component/addMachine";
import AddComponent from "./component/addComponent";

function App() {
  return (
    <Router>
      <div className='App'>
        <Sidebar />
        <div className='right-section'>
          <Header />
          <div className='main-content'>
            <Routes>
              <Route path='/add-machine' element={<AddMachine />} />
              <Route path='/add-component' element={<AddComponent />} />
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
      <h2>Dashboard</h2>
      <Link to='/add-machine' className='sidebar-link'>
        Add Machine
      </Link>
      <Link to='/add-component' className='sidebar-link'>
        Add Component
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
