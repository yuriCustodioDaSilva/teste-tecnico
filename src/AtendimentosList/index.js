import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const AtendimentosList = () => {
  const [atendimentos, setAtendimentos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);

  const fetchAtendimentos = async () => {
    try {
      const res = await axios.get('http://localhost:5274/atendimentos');
      setAtendimentos(res.data);
    } catch (error) {
      console.error('Erro ao buscar atendimentos', error);
    }
  };

  useEffect(() => {
    fetchAtendimentos();
  }, []);

  const handleEditar = (atendimento) => {

    setAtendimentoSelecionado({ ...atendimento });
    setShowModal(true);
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este atendimento?')) {
      try {
        await axios.delete(`http://localhost:5274/atendimentos/${id}`);
        fetchAtendimentos();
      } catch (error) {
        console.error('Erro ao excluir atendimento', error);
      }
    }
  };

  const handleSalvar = async () => {
    try {
      await axios.put(`http://localhost:5274/atendimentos/${atendimentoSelecionado.id}`, {
        Id: atendimentoSelecionado.id,
        PacienteId: atendimentoSelecionado.pacienteId,
        DataHora: atendimentoSelecionado.dataHora,
        Descricao: atendimentoSelecionado.descricao,
        Status: atendimentoSelecionado.status,
      });
      setShowModal(false);
      fetchAtendimentos();
    } catch (error) {
      console.error('Erro ao atualizar atendimento', error);
      alert('Erro ao atualizar atendimento.');
    }
  };

  const handleChange = (e) => {
    setAtendimentoSelecionado({
      ...atendimentoSelecionado,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Container className="mt-5" data-bs-theme="dark">
      <h2 className="mb-4">Atendimentos Cadastrados</h2>
      <Table striped bordered hover variant="dark" responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Paciente ID</th>
            <th>Data e Hora</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {atendimentos.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.pacienteId}</td>
              <td>{new Date(a.dataHora).toLocaleString()}</td>
              <td>{a.descricao}</td>
              <td>{a.status}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEditar(a)}>
                  Editar
                </Button>{' '}
                <Button variant="danger" size="sm" onClick={() => handleExcluir(a.id)}>
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de edição */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Atendimento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {atendimentoSelecionado && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Paciente ID</Form.Label>
                <Form.Control
                  type="number"
                  name="pacienteId"
                  value={atendimentoSelecionado.pacienteId}
                  onChange={handleChange}
                  readOnly
                  plaintext
                />
                <Form.Text className="text-muted">
                  Para alterar o paciente, faça pelo cadastro de atendimento.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Data e Hora</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="dataHora"
                  value={atendimentoSelecionado.dataHora.slice(0, 16)}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descricao"
                  value={atendimentoSelecionado.descricao}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={atendimentoSelecionado.status}
                  onChange={handleChange}
                >
                  <option value="">Selecione</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Inativo">Inativo</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSalvar}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AtendimentosList;
