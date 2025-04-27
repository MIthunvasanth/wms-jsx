import "./App.css";
import Home from './component/home';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddMachine from './component/addMachine';
import AddComponent from './component/addComponent';

function App() {
  return (
    <Router>
      <div className='App'>
        <Header />
        <div className='main'>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Header() {
  return (
    <header>
      <button
        id='minimize'
        onClick={() => window.electron.sendFrameAction("MINIMIZE")}
      />
      <button
        id='maximize'
        onClick={() => window.electron.sendFrameAction("MAXIMIZE")}
      />
      <button
        id='close'
        onClick={() => window.electron.sendFrameAction("CLOSE")}
      />
    </header>
  );
}



function About() {
  return <div>About Page</div>;
}

export default App;
