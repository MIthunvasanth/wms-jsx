import "./App.css";

function App() {
  return (
    <div className='App'>
      <Header />
      <div className='main'>hi</div>
    </div>
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

export default App;
