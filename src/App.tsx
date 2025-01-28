import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import Settings from './components/Settings';
import './App.css';

function App() {
  const [selectedCharacter, setSelectedCharacter] = useState('lain');

  return (
    <Router>
      <div className="sidebar">
        <nav>
          <Link to="/" className="nav-link">
            <span className="material-icons">chat</span>

          </Link>
          <Link to="/settings" className="nav-link">
            <span className="material-icons">settings</span>

          </Link>
        </nav>
      </div>
      
      <Routes>
        <Route 
          path="/" 
          element={<ChatInterface selectedCharacter={selectedCharacter} />} 
        />
        <Route 
          path="/settings" 
          element={
            <Settings 
              selectedCharacter={selectedCharacter}
              onCharacterSelect={setSelectedCharacter} 
            />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;