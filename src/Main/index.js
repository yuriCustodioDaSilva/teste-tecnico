import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Main = () => {
  const navigate = useNavigate();

  return (
    <Container className="main-container mt-5" data-bs-theme="dark">
      <h1 className="mb-4 text-center">Sistema de Atendimento</h1>
      <Row className="justify-content-center g-3">
        <Col xs={6} md={4}>
          <Button
            variant="primary"
            className="w-100"
            onClick={() => navigate('/cadastro')}
          >
            Cadastrar Usuário
          </Button>
        </Col>

        <Col xs={6} md={4}>
          <Button
            variant="success"
            className="w-100"
            onClick={() => navigate('/atendimento-cadastro')}
          >
            Cadastrar Atendimento
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Main;
