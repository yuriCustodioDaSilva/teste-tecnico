import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './Main';
import Cadastro from './Cadastro';
import EditarPaciente from './EditarPaciente';
import AtendimentoCadastro from './AtendimentoCadastro';
import AtendimentosList from './AtendimentosList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './global.css';

const App = () => {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main setAuthenticated={setAuthenticated} />} />
        <Route path="/main" element={<Main />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/editar-pacientes" element={<EditarPaciente />} />
        <Route path="/atendimento-cadastro" element={<AtendimentoCadastro />} />
        <Route path="/atendimento-list" element={<AtendimentosList />} />
      </Routes>
    </Router>
  );
};

export default App;
