import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './Main';
import Cadastro from './Cadastro';
// import Listagem from './Listagem';

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main setAuthenticated={setAuthenticated} />} />
        {/* <Route path="/cadastro" element={<Cadastro />} /> */}
        {/* <Route path="/listagem" element={<Listagem />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
