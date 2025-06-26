import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cadastro from './Cadastro';
import Listagem from './Listagem';

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Cadastro setAuthenticated={setAuthenticated} />} />
        <Route path="/listagem" element={<Listagem />} />
      </Routes>
    </Router>
  );
};

export default App;
