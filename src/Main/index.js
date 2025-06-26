import React, { useEffect, useState } from 'react';
import { Button, Container, Modal, Form, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { notifica } from '../Components';
import './styles.css';

const Main = () => {
  const [pacientes, setPacientes] = useState([]);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showEdicao, setShowEdicao] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    cpf: '',
    sexo: '',
    status: 'Ativo',
  });

  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    bairro: '',
    localidade: '',
    complemento: '',
  });

  const [atendimentoData, setAtendimentoData] = useState({
    descricao: '',
    dataHora: new Date().toISOString().slice(0, 16),
  });

  const [filtros, setFiltros] = useState({
    nome: '',
    cpf: '',
    sexo: '',
    status: '',
    dataNascimento: '',
  });

  const statusOptions = [
    { value: '', label: 'Todos status' },
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
  ];

  const sexoOptions = [
    { value: '', label: 'Todos sexos' },
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' },
    { value: 'Prefiro não informar', label: 'Prefiro não informar' },
  ];

  useEffect(() => {
    buscarPacientes();
  }, [filtros]);

  const buscarPacientes = async () => {
    try {
      const params = {};
      Object.entries(filtros).forEach(([key, val]) => {
        if (val.trim() !== '') params[key] = val.trim();
      });
      const response = await axios.get('http://localhost:5274/pacientes', { params });
      setPacientes(response.data);
    } catch {
      notifica('Erro', 'Não foi possível buscar os pacientes', 'error');
    }
  };

  const formatCPF = (value) => {
    let cpf = value.replace(/\D/g, '').substring(0, 11);
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
  };

  const verificaMudanca = (e) => {
    const { name, value } = e.target;
    if (name === 'cpf') setFormData({ ...formData, cpf: formatCPF(value) });
    else setFormData({ ...formData, [name]: value });
  };

  const buscarEnderecoPorCep = async (cep) => {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      return data.erro ? null : data;
    } catch {
      return null;
    }
  };

  const handleCepChange = async (e) => {
    let cep = e.target.value.replace(/\D/g, '').substring(0, 8);
    setEndereco((prev) => ({ ...prev, cep }));

    if (cep.length === 8) {
      const dados = await buscarEnderecoPorCep(cep);
      if (dados) {
        setEndereco({
          cep: dados.cep || '',
          logradouro: dados.logradouro || '',
          bairro: dados.bairro || '',
          localidade: dados.localidade || '',
          complemento: dados.complemento || '',
        });
      } else {
        alert('CEP inválido!');
        setEndereco({ cep, logradouro: '', bairro: '', localidade: '', complemento: '' });
      }
    }
  };

  const btnCadastro = () => {
    setFormData({ nome: '', dataNascimento: '', cpf: '', sexo: '', status: 'Ativo' });
    setEndereco({ cep: '', logradouro: '', bairro: '', localidade: '', complemento: '' });
    setAtendimentoData({ descricao: '', dataHora: new Date().toISOString().slice(0, 16) });
    setShowCadastro(true);
  };

  const submitCadastro = async () => {
    if (
      Object.values(formData).some((v) => !v.trim()) ||
      !atendimentoData.descricao.trim()
    ) {
      notifica('Erro', 'Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const payload = {
      paciente: {
        ...formData,
        endereco: endereco.logradouro,
        cep: endereco.cep,
        bairro: endereco.bairro,
        cidade: endereco.localidade,
        complemento: endereco.complemento,
      },
      atendimento: {
        descricao: atendimentoData.descricao,
        dataHora: new Date(atendimentoData.dataHora).toISOString(),
      },
    };

    try {
      await axios.post('http://localhost:5274/atendimentos/completo', payload);
      notifica('Sucesso', 'Paciente e Atendimento cadastrados com sucesso!', 'success');
      setShowCadastro(false);
      buscarPacientes();
    } catch (error) {
      notifica('Erro', error.response?.data || 'Erro ao cadastrar paciente e atendimento', 'error');
    }
  };

  const btnEdit = (paciente) => {
    setPacienteSelecionado(paciente);
    setFormData({
      nome: paciente.nome,
      dataNascimento: paciente.dataNascimento.split('T')[0],
      cpf: paciente.cpf,
      sexo: paciente.sexo,
      status: paciente.status,
    });
    setEndereco({
      cep: paciente.cep || '',
      logradouro: paciente.endereco || '',
      bairro: paciente.bairro || '',
      localidade: paciente.cidade || '',
      complemento: paciente.complemento || '',
    });
    setShowEdicao(true);
  };

  const submitEdicao = async () => {
    if (Object.values(formData).some((v) => !v.trim())) {
      notifica('Erro', 'Preencha todos os campos obrigatórios', 'error');
      return;
    }

    const payload = {
      id: pacienteSelecionado.id,
      ...formData,
      endereco: endereco.logradouro,
      cep: endereco.cep,
      bairro: endereco.bairro,
      cidade: endereco.localidade,
      complemento: endereco.complemento,
    };

    try {
      await axios.put(`http://localhost:5274/pacientes/${pacienteSelecionado.id}`, payload);
      notifica('Sucesso', 'Paciente atualizado com sucesso!', 'success');
      setShowEdicao(false);
      buscarPacientes();
    } catch (error) {
      notifica('Erro', error.response?.data || 'Erro ao atualizar paciente', 'error');
    }
  };

  const submitDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter isso!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5274/pacientes/${id}`);
        notifica('Sucesso', 'Paciente excluído com sucesso!', 'success');
        buscarPacientes();
      } catch {
        notifica('Erro', 'Erro ao excluir paciente', 'error');
      }
    }
  };

  const filtroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Container className="mt-3">
      <h2>Pacientes</h2>

      {/* Filtros */}
      <Form className="mb-3">
        <Row>
          <Col md={3}>
            <Form.Control
              placeholder="Nome"
              name="nome"
              value={filtros.nome}
              onChange={filtroChange}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              placeholder="CPF"
              name="cpf"
              value={filtros.cpf}
              onChange={filtroChange}
            />
          </Col>
          <Col md={2}>
            <Form.Control
              type="date"
              name="dataNascimento"
              value={filtros.dataNascimento}
              onChange={filtroChange}
            />
          </Col>
          <Col md={2}>
            <Form.Select name="sexo" value={filtros.sexo} onChange={filtroChange}>
              {sexoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select name="status" value={filtros.status} onChange={filtroChange}>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={1}>
            <Button variant="primary" onClick={buscarPacientes}>
              Buscar
            </Button>
          </Col>
        </Row>
      </Form>

      <Button variant="primary" onClick={btnCadastro}>
        Cadastrar Paciente + Atendimento
      </Button>

      {/* Tabela de pacientes */}
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Data Nascimento</th>
            <th>Sexo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center">
                Nenhum paciente encontrado
              </td>
            </tr>
          )}
          {pacientes.map((paciente) => (
            <tr key={paciente.id}>
              <td>{paciente.nome}</td>
              <td>{paciente.cpf}</td>
              <td>{new Date(paciente.dataNascimento).toLocaleDateString()}</td>
              <td>{paciente.sexo}</td>
              <td>{paciente.status}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => btnEdit(paciente)}
                  className="me-2"
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => submitDelete(paciente.id)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Cadastro */}
      <Modal show={showCadastro} onHide={() => setShowCadastro(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Cadastrar Paciente e Atendimento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Dados Paciente */}
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="nome">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={verificaMudanca}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="dataNascimento">
                  <Form.Label>Data de Nascimento</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={verificaMudanca}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="cpf">
                  <Form.Label>CPF</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={verificaMudanca}
                    placeholder="000.000.000-00"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="sexo">
                  <Form.Label>Sexo</Form.Label>
                  <Form.Select name="sexo" value={formData.sexo} onChange={verificaMudanca}>
                    {sexoOptions
                      .filter((opt) => opt.value !== '')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={verificaMudanca}>
                    {statusOptions
                      .filter((opt) => opt.value !== '')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Dados Endereço */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="cep">
                  <Form.Label>CEP</Form.Label>
                  <Form.Control
                    type="text"
                    name="cep"
                    value={endereco.cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="logradouro">
                  <Form.Label>Logradouro</Form.Label>
                  <Form.Control
                    type="text"
                    name="logradouro"
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="bairro">
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control
                    type="text"
                    name="bairro"
                    value={endereco.bairro}
                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="localidade">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="localidade"
                    value={endereco.localidade}
                    onChange={(e) => setEndereco({ ...endereco, localidade: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="complemento">
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type="text"
                    name="complemento"
                    value={endereco.complemento}
                    onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Dados Atendimento */}
            <hr />
            <h5>Dados do Atendimento</h5>

            <Form.Group className="mb-3" controlId="descricaoAtendimento">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={atendimentoData.descricao}
                onChange={(e) => setAtendimentoData({ ...atendimentoData, descricao: e.target.value })}
                placeholder="Descrição do atendimento"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="dataHoraAtendimento">
              <Form.Label>Data e Hora</Form.Label>
              <Form.Control
                type="datetime-local"
                value={atendimentoData.dataHora}
                onChange={(e) => setAtendimentoData({ ...atendimentoData, dataHora: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCadastro(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submitCadastro}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Edição */}
      <Modal show={showEdicao} onHide={() => setShowEdicao(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Paciente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="nomeEdit">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={verificaMudanca}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="dataNascimentoEdit">
                  <Form.Label>Data de Nascimento</Form.Label>
                  <Form.Control
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={verificaMudanca}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="cpfEdit">
                  <Form.Label>CPF</Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={verificaMudanca}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="sexoEdit">
                  <Form.Label>Sexo</Form.Label>
                  <Form.Select name="sexo" value={formData.sexo} onChange={verificaMudanca}>
                    {sexoOptions
                      .filter((opt) => opt.value !== '')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="statusEdit">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={verificaMudanca}>
                    {statusOptions
                      .filter((opt) => opt.value !== '')
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="cepEdit">
                  <Form.Label>CEP</Form.Label>
                  <Form.Control
                    type="text"
                    name="cep"
                    value={endereco.cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="logradouroEdit">
                  <Form.Label>Logradouro</Form.Label>
                  <Form.Control
                    type="text"
                    name="logradouro"
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="bairroEdit">
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control
                    type="text"
                    name="bairro"
                    value={endereco.bairro}
                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="localidadeEdit">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="localidade"
                    value={endereco.localidade}
                    onChange={(e) => setEndereco({ ...endereco, localidade: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="complementoEdit">
                  <Form.Label>Complemento</Form.Label>
                  <Form.Control
                    type="text"
                    name="complemento"
                    value={endereco.complemento}
                    onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdicao(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submitEdicao}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Main;