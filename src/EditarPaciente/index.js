import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import './styles.css';
import { useNavigate } from 'react-router-dom';

const EditarPaciente = () => {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

    const fetchPacientes = async () => {
        try {
            const res = await axios.get('http://localhost:5274/pacientes');
            setPacientes(res.data);
        } catch (error) {
            console.error('Erro ao buscar pacientes', error);
        }
    };

    useEffect(() => {
        fetchPacientes();
    }, []);

    const handleEditar = (paciente) => {
        setPacienteSelecionado({ ...paciente });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
            try {
                await axios.delete(`http://localhost:5274/pacientes/${id}`);
                fetchPacientes();
            } catch (error) {
                console.error('Erro ao excluir paciente', error);
            }
        }
    };

    const handleSalvar = async () => {
        try {
            await axios.put(`http://localhost:5274/pacientes/${pacienteSelecionado.id}`, pacienteSelecionado);
            setShowModal(false);
            fetchPacientes();
        } catch (error) {
            console.error('Erro ao atualizar paciente', error);
        }
    };

    const handleChange = (e) => {
        setPacienteSelecionado({
            ...pacienteSelecionado,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Container data-bs-theme="dark" className="mt-5 formContainer">
            <h2 className="mb-4">Pacientes Cadastrados</h2>
            <div className="mb-3 d-flex gap-2">
                <Button variant="outline-light" onClick={() => navigate('/main')}>
                    Voltar para Home
                </Button>
                <Button variant="outline-success" onClick={() => navigate('/')}>
                    Ir para Cadastro
                </Button>
            </div>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Sexo</th>
                        <th>Cidade</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {pacientes.map((paciente) => (
                        <tr key={paciente.id}>
                            <td>{paciente.nome}</td>
                            <td>{paciente.cpf}</td>
                            <td>{paciente.sexo}</td>
                            <td>{paciente.cidade}</td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => handleEditar(paciente)}>Editar</Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => handleDelete(paciente.id)}>Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal de Edição */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Paciente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {pacienteSelecionado && (
                        <Form>
                            <Form.Group className="mb-2">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control
                                    name="nome"
                                    value={pacienteSelecionado.nome}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>CPF</Form.Label>
                                <Form.Control
                                    name="cpf"
                                    value={pacienteSelecionado.cpf}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Sexo</Form.Label>
                                <Form.Select
                                    name="sexo"
                                    value={pacienteSelecionado.sexo}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Prefiro não informar">Prefiro não informar</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>CEP</Form.Label>
                                <Form.Control
                                    name="cep"
                                    value={pacienteSelecionado.cep || ''}
                                    onChange={async (e) => {
                                        const cep = e.target.value.replace(/\D/g, '');
                                        setPacienteSelecionado({ ...pacienteSelecionado, cep });

                                        if (cep.length === 8) {
                                            try {
                                                const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                                const data = await res.json();
                                                if (!data.erro) {
                                                    setPacienteSelecionado(prev => ({
                                                        ...prev,
                                                        endereco: data.logradouro,
                                                        bairro: data.bairro,
                                                        cidade: data.localidade
                                                    }));
                                                }
                                            } catch (error) {
                                                console.error('Erro ao buscar CEP', error);
                                            }
                                        }
                                    }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Endereço</Form.Label>
                                <Form.Control
                                    name="endereco"
                                    value={pacienteSelecionado.endereco || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Bairro</Form.Label>
                                <Form.Control
                                    name="bairro"
                                    value={pacienteSelecionado.bairro || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Cidade</Form.Label>
                                <Form.Control
                                    name="cidade"
                                    value={pacienteSelecionado.cidade || ''}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-2">
                                <Form.Label>Complemento</Form.Label>
                                <Form.Control
                                    name="complemento"
                                    value={pacienteSelecionado.complemento || ''}
                                    onChange={handleChange}
                                />
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

export default EditarPaciente;