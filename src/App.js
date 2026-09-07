import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import ArtistDetail from './pages/ArtistDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-light" style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artist/:id" element={<ArtistDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;