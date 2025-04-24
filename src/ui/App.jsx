import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className='App'>
        <Header />
        <div className='main'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
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

function Home() {
  return <div>Home Page</div>;
}

function About() {
  return <div>About Page</div>;
}

export default App;
