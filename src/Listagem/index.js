import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';

const Listagem = () => {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [formEdicao, setFormEdicao] = useState({ nome: '', cpf: '' });

    useEffect(() => {
        buscarPacientes();
    }, []);

    const buscarPacientes = () => {
        axios.get('http://localhost:5274/pacientes')
            .then(response => setPacientes(response.data))
            .catch(error => console.error('Erro ao buscar pacientes:', error));
    };

    const excluirPaciente = (id) => {
        if (window.confirm("Tem certeza que deseja excluir este paciente?")) {
            axios.delete(`http://localhost:5274/pacientes/${id}`)
                .then(() => setPacientes(pacientes.filter(p => p.id !== id)))
                .catch(error => console.error('Erro ao excluir paciente:', error));
        }
    };

    const iniciarEdicao = (paciente) => {
        setEditandoId(paciente.id);
        setFormEdicao({ nome: paciente.nome, cpf: paciente.cpf });
    };

    const cancelarEdicao = () => {
        setEditandoId(null);
        setFormEdicao({ nome: '', cpf: '' });
    };

    const salvarEdicao = () => {
        axios.put(`http://localhost:5274/pacientes/${editandoId}`, {
            id: editandoId,
            nome: formEdicao.nome,
            cpf: formEdicao.cpf
        })
            .then(() => {
                buscarPacientes();
                cancelarEdicao();
            })
            .catch(error => console.error('Erro ao editar paciente:', error));
    };

    const voltarParaCadastro = () => navigate('/');

    return (
        <Container className="mt-5 text-white bg-dark p-4 rounded">
            <Button variant="light" onClick={voltarParaCadastro}>
                Voltar para Cadastro
            </Button>
            <br /><br />

            <h4>Pacientes cadastrados:</h4>
            {pacientes.length === 0 ? (
                <p>Nenhum paciente encontrado.</p>
            ) : (
                pacientes.map((paciente) => (
                    <Row key={paciente.id} className="mb-3 align-items-center border-bottom pb-2">
                        <Col>
                            {editandoId === paciente.id ? (
                                <>
                                    <Form.Control
                                        className="mb-2"
                                        value={formEdicao.nome}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, nome: e.target.value })}
                                    />
                                    <Form.Control
                                        value={formEdicao.cpf}
                                        onChange={(e) => setFormEdicao({ ...formEdicao, cpf: e.target.value })}
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="mb-1"><strong>Nome:</strong> {paciente.nome}</p>
                                    <p className="mb-0"><strong>CPF:</strong> {paciente.cpf}</p>
                                </>
                            )}
                        </Col>
                        <Col xs="auto">
                            {editandoId === paciente.id ? (
                                <>
                                    <Button size="sm" variant="success" onClick={salvarEdicao}>Salvar</Button>{' '}
                                    <Button size="sm" variant="secondary" onClick={cancelarEdicao}>Cancelar</Button>
                                </>
                            ) : (
                                <>
                                    <Button size="sm" variant="primary" onClick={() => iniciarEdicao(paciente)}>Editar</Button>{' '}
                                    <Button size="sm" variant="danger" onClick={() => excluirPaciente(paciente.id)}>Excluir</Button>
                                </>
                            )}
                        </Col>
                    </Row>
                ))
            )}
        </Container>
    );
};

export default Listagem;
