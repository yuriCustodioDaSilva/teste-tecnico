import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Cadastro from './Cadastro'
const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Cadastro />}></Route>
      </Routes>
    </Router>
  );
};

export default App;
