import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import { notifica } from '../Components';

const AtendimentoCadastro = () => {
    const [atendimentos, setAtendimentos] = useState([]);
    const [pacientes, setPacientes] = useState([]);

    const [filtroCpf, setFiltroCpf] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('Ativo');

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [editandoAtendimento, setEditandoAtendimento] = useState(null);

    const [pacienteId, setPacienteId] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const [status, setStatus] = useState('');

    const fetchAtendimentos = async () => {
        try {
            const res = await axios.get('http://localhost:5274/atendimentos');
            setAtendimentos(res.data);
        } catch (error) {
            console.error('Erro ao buscar atendimentos', error);
            notifica('Erro', 'Erro ao buscar atendimentos.', 'error');
        }
    };

    const fetchPacientes = async () => {
        try {
            const res = await axios.get('http://localhost:5274/pacientes');
            setPacientes(res.data);
        } catch (error) {
            console.error('Erro ao buscar pacientes', error);
            notifica('Erro', 'Erro ao buscar pacientes.', 'error');
        }
    };

    useEffect(() => {
        fetchAtendimentos();
        fetchPacientes();
    }, []);

    const atendimentosFiltrados = atendimentos.filter((at) => {
        const paciente = pacientes.find(p => p.id === at.pacienteId);
        const filtroCpfOk = filtroCpf ? paciente?.cpf.includes(filtroCpf) : true;
        const filtroStatusOk = filtroStatus ? at.status === filtroStatus : true;
        return filtroCpfOk && filtroStatusOk;
    });

    const abrirModalNovo = () => {
        setModalTitle('Cadastrar Atendimento');
        setEditandoAtendimento(null);
        setPacienteId('');
        setDataHora('');
        setDescricao('');
        setStatus('Ativo');
        setShowModal(true);
    };

    const abrirModalEditar = (atendimento) => {
        setModalTitle('Editar Atendimento');
        setEditandoAtendimento(atendimento);
        setPacienteId(atendimento.pacienteId);
        setDataHora(atendimento.dataHora ? atendimento.dataHora.substring(0, 16) : '');
        setDescricao(atendimento.descricao);
        setStatus(atendimento.status);
        setShowModal(true);
    };

    const handleSalvar = async (e) => {
        e.preventDefault();

        const agora = new Date();
        const dataHoraDate = new Date(dataHora);
        if (dataHoraDate > agora) {
            notifica('Erro', 'Data e hora não podem ser no futuro.', 'error');
            return;
        }

        const existeAtivo = atendimentos.some(at =>
            at.pacienteId === parseInt(pacienteId) &&
            at.status === 'Ativo' &&
            (!editandoAtendimento || at.id !== editandoAtendimento.id)
        );

        if (status === 'Ativo' && existeAtivo) {
            notifica('Erro', 'Já existe um atendimento ativo para este paciente.', 'error');
            return;
        }

        const payload = {
            pacienteId: parseInt(pacienteId),
            dataHora,
            descricao,
            status,
        };

        try {
            if (editandoAtendimento) {
                await axios.put(`http://localhost:5274/atendimentos/${editandoAtendimento.id}`, payload);
                notifica('Sucesso', 'Atendimento atualizado com sucesso!', 'success');
            } else {
                await axios.post('http://localhost:5274/atendimentos', payload);
                notifica('Sucesso', 'Atendimento cadastrado com sucesso!', 'success');
            }
            setShowModal(false);
            fetchAtendimentos();
        } catch (error) {
            console.error('Erro ao salvar atendimento', error);
            notifica('Erro', 'Erro ao salvar atendimento.', 'error');
        }
    };

    const toggleStatus = async (atendimento) => {
        const novoStatus = atendimento.status === 'Ativo' ? 'Inativo' : 'Ativo';

        const confirmResult = await Swal.fire({
            title: `Deseja ${novoStatus === 'Ativo' ? 'ativar' : 'inativar'} este atendimento?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
        });

        if (!confirmResult.isConfirmed) return;

        try {
            if (novoStatus === 'Inativo') {
                await axios.delete(`http://localhost:5274/atendimentos/${atendimento.id}`);
            } else {
                const payload = {
                    pacienteId: atendimento.pacienteId,
                    dataHora: atendimento.dataHora,
                    descricao: atendimento.descricao,
                    status: novoStatus
                };

                const existeAtivo = atendimentos.some(at =>
                    at.pacienteId === atendimento.pacienteId &&
                    at.status === 'Ativo' &&
                    at.id !== atendimento.id
                );

                if (existeAtivo) {
                    notifica('Erro', 'Já existe outro atendimento ativo para este paciente.', 'error');
                    return;
                }

                await axios.put(`http://localhost:5274/atendimentos/${atendimento.id}`, payload);
            }
            notifica('Sucesso', `Atendimento ${novoStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso!`, 'success');
            fetchAtendimentos();
        } catch (error) {
            console.error('Erro ao alterar status do atendimento', error);
            notifica('Erro', 'Erro ao alterar status do atendimento.', 'error');
        }
    };

    const handleExcluirDefinitivo = async (id) => {
        const confirmResult = await Swal.fire({
            title: 'Tem certeza que deseja excluir este atendimento definitivamente?',
            text: 'Esta ação não pode ser desfeita.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await axios.delete(`http://localhost:5274/atendimentos/${id}/excluir`);
            notifica('Sucesso', 'Atendimento excluído definitivamente!', 'success');
            fetchAtendimentos();
        } catch (error) {
            console.error('Erro ao excluir atendimento', error);
            notifica('Erro', 'Erro ao excluir atendimento.', 'error');
        }
    };

    const pacienteSelecionado = pacientes.find(p => p.id === parseInt(pacienteId));

    return (
        <Container className="mt-4" data-bs-theme="dark">
            <h2 className="mb-4">Atendimentos</h2>

            <Row className="mb-3 align-items-center" xs="auto">
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Filtrar por CPF"
                        value={filtroCpf}
                        onChange={e => setFiltroCpf(e.target.value)}
                    />
                </Col>
                <Col>
                    <Form.Select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                        <option value="">Filtrar por status</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </Form.Select>
                </Col>
                <Col>
                    <Button variant="success" onClick={abrirModalNovo}>Novo Atendimento</Button>
                </Col>
            </Row>

            <Table striped bordered hover responsive variant="dark">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Paciente</th>
                        <th>Data e Hora</th>
                        <th>Descrição</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {atendimentosFiltrados.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center">Nenhum atendimento encontrado</td>
                        </tr>
                    )}
                    {atendimentosFiltrados.map(at => {
                        const paciente = pacientes.find(p => p.id === at.pacienteId);
                        return (
                            <tr key={at.id}>
                                <td>{at.id}</td>
                                <td>{paciente ? `${paciente.nome} - ${paciente.cpf}` : 'Paciente não encontrado'}</td>
                                <td>{new Date(at.dataHora).toLocaleString()}</td>
                                <td style={{ whiteSpace: 'pre-wrap' }}>{at.descricao}</td>
                                <td>{at.status}</td>
                                <td>
                                    <Button variant="warning" size="sm" onClick={() => abrirModalEditar(at)}>Editar</Button>{' '}
                                    <Button
                                        variant={at.status === 'Ativo' ? 'danger' : 'success'}
                                        size="sm"
                                        onClick={() => toggleStatus(at)}
                                    >
                                        {at.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                                    </Button>{' '}
                                    <Button variant="outline-danger" size="sm" onClick={() => handleExcluirDefinitivo(at.id)}>Excluir</Button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSalvar}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Paciente</Form.Label>
                            <Form.Select
                                value={pacienteId}
                                onChange={e => setPacienteId(e.target.value)}
                                required
                            >
                                <option value="">Selecione um paciente</option>
                                {pacientes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome} - {p.cpf}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>CPF do Paciente</Form.Label>
                            <Form.Control
                                type="text"
                                value={pacienteSelecionado ? pacienteSelecionado.cpf : ''}
                                readOnly
                                plaintext
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Data e Hora</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={dataHora}
                                onChange={e => setDataHora(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={descricao}
                                onChange={e => setDescricao(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                required
                            >
                                <option value="">Selecione</option>
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                        <Button variant="success" type="submit">Salvar</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AtendimentoCadastro;