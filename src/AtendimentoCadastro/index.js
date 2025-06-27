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
    const [cpfDigitado, setCpfDigitado] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [descricao, setDescricao] = useState('');
    const status = 'Ativo';

    const fetchAtendimentos = async () => {
        try {
            const params = {};
            if (filtroStatus) params.status = filtroStatus;

            const res = await axios.get('http://localhost:5274/atendimentos/filtrar', { params });
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
        fetchPacientes();
    }, []);

    useEffect(() => {
        fetchAtendimentos();
    }, [filtroStatus]);

    const atendimentosFiltrados = atendimentos.filter((at) => {
        const paciente = pacientes.find(p => p.id === at.pacienteId);
        const filtroCpfOk = filtroCpf ? paciente?.cpf.includes(filtroCpf) : true;
        return filtroCpfOk;
    });

    const abrirModalNovo = () => {
        setModalTitle('Cadastrar Atendimento');
        setEditandoAtendimento(null);
        setDataHora('');
        setDescricao('');
        setCpfDigitado('');
        setShowModal(true);
    };

    const abrirModalEditar = (atendimento) => {
        const paciente = pacientes.find(p => p.id === atendimento.pacienteId);
        setModalTitle('Editar Atendimento');
        setEditandoAtendimento(atendimento);
        setDataHora(atendimento.dataHora ? atendimento.dataHora.substring(0, 16) : '');
        setDescricao(atendimento.descricao);
        setCpfDigitado(paciente?.cpf || '');
        setShowModal(true);
    };

    const btnSalvar = async (e) => {
        e.preventDefault();

        const paciente = pacientes.find(p => p.cpf === cpfDigitado);

        if (!paciente) {
            notifica('Erro', 'Paciente com o CPF informado não foi encontrado.', 'error');
            return;
        }

        const agora = new Date();
        const dataHoraDate = new Date(dataHora);
        if (dataHoraDate > agora) {
            notifica('Erro', 'Data e hora não podem ser no futuro.', 'error');
            return;
        }

        const existeAtivo = atendimentos.some(at =>
            at.pacienteId === paciente.id &&
            at.status === 'Ativo' &&
            (!editandoAtendimento || at.id !== editandoAtendimento.id)
        );

        if (existeAtivo && !editandoAtendimento) {
            notifica('Erro', 'Já existe um atendimento ativo para este paciente.', 'error');
            return;
        }

        const payload = {
            id: editandoAtendimento ? editandoAtendimento.id : undefined,
            pacienteId: paciente.id,
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
            await axios.put(`http://localhost:5274/atendimentos/${atendimento.id}/status`, { status: novoStatus });

            notifica('Sucesso', `Atendimento ${novoStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso!`, 'success');
            fetchAtendimentos();
        } catch (error) {
            console.error('Erro ao alterar status do atendimento', error);

            if (error.response && error.response.data) {
                notifica('Erro', error.response.data, 'error');
            } else {
                notifica('Erro', 'Erro ao alterar status do atendimento.', 'error');
            }
        }
    };

    const formatCPF = (value) => {
        let cpf = value.replace(/\D/g, '').substring(0, 11);
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return cpf;
    };

    const btnExcluir = async (id) => {
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
            await axios.delete(`http://localhost:5274/atendimentos/${id}`);
            notifica('Sucesso', 'Atendimento excluído definitivamente!', 'success');
            fetchAtendimentos();
        } catch (error) {
            console.error('Erro ao excluir atendimento', error);
            notifica('Erro', 'Erro ao excluir atendimento.', 'error');
        }
    };


    return (
        <Container className="mt-4" data-bs-theme="dark">
            <h2 className="mb-4">Atendimentos</h2>

            <Row className="mb-3 align-items-center" style={{ flexWrap: 'nowrap', gap: '10px' }}>
                <Col xs="auto" className="d-flex justify-content-start">
                    <Button variant="secondary" onClick={() => window.location.href = '/'}>Voltar para Home</Button>
                </Col>

                <Col xs="auto" className="d-flex align-items-center" style={{ gap: '10px', flexWrap: 'nowrap' }}>
                    <Form.Control
                        type="text"
                        placeholder="Filtrar por CPF"
                        value={filtroCpf}
                        onChange={e => setFiltroCpf(e.target.value)}
                        style={{ width: '180px', whiteSpace: 'nowrap' }}
                    />
                    <Form.Select
                        value={filtroStatus}
                        onChange={e => setFiltroStatus(e.target.value)}
                        style={{ width: '140px' }}
                    >
                        <option value="">Filtrar por status</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </Form.Select>
                </Col>

                <Col xs="auto" className="d-flex justify-content-end">
                    <Button variant="success" onClick={abrirModalNovo}>Novo Atendimento</Button>
                </Col>
            </Row>

            <Table striped bordered hover responsive variant="dark">
                <thead>
                    <tr>
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
                                <td>{paciente ? `${paciente.nome} - ${paciente.cpf}` : 'Paciente não encontrado'}</td>
                                <td>{new Date(at.dataHora).toLocaleString()}</td>
                                <td style={{ whiteSpace: 'pre-wrap' }}>{at.descricao}</td>
                                <td>{at.status}</td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <Button
                                            variant="warning"
                                            size="sm"
                                            className="mb-1"
                                            onClick={() => abrirModalEditar(at)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant={at.status === 'Ativo' ? 'secondary' : 'success'}
                                            size="sm"
                                            className="mb-1"
                                            onClick={() => toggleStatus(at)}
                                        >
                                            {at.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => btnExcluir(at.id)}
                                        >
                                            Excluir
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={btnSalvar}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>CPF do Paciente</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite o CPF do paciente"
                                value={cpfDigitado}
                                onChange={e => setCpfDigitado(formatCPF(e.target.value))}
                                maxLength={14}
                                required
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
                                rows={3}
                                value={descricao}
                                onChange={e => setDescricao(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Salvar
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AtendimentoCadastro;