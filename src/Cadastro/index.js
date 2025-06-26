import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Table, InputGroup, Modal } from 'react-bootstrap';
import { notifica } from "../Components";
import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Cadastro = () => {
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [sexo, setSexo] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [endereco, setEndereco] = useState({ cep: '', logradouro: '', bairro: '', localidade: '', complemento: '' });

    const [pacientes, setPacientes] = useState([]);
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroCPF, setFiltroCPF] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [erroMensagem, setErroMensagem] = useState('');

    useEffect(() => {
        carregarPacientes();
    }, []);

    const carregarPacientes = async () => {
        try {
            const res = await axios.get('http://localhost:5274/pacientes');
            setPacientes(res.data);
        } catch (err) {
            console.error(err);
            notifica('Erro', 'Falha ao carregar pacientes', 'error');
        }
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

    const cepChange = async (e) => {
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
                    complemento: dados.complemento || ''
                });
            } else {
                notifica('Erro', 'CEP inválido!', 'error');
                setEndereco({ cep, logradouro: '', bairro: '', localidade: '', complemento: '' });
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

    const handleCPFChange = (e) => {
        const valor = e.target.value;
        const soNumeros = valor.replace(/\D/g, '');
        setCpf(formatCPF(soNumeros));
        setErroMensagem('');
    };

    const limparErroAoDigitar = (setter) => (e) => {
        setter(e.target.value);
        setErroMensagem('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErroMensagem('');

        const payload = {
            id: editandoId ?? undefined,
            nome,
            cpf: cpf.replace(/\D/g, ''),
            sexo,
            dataNascimento,
            cep: endereco.cep,
            cidade: endereco.localidade,
            bairro: endereco.bairro,
            endereco: endereco.logradouro,
            complemento: endereco.complemento
        };

        try {
            if (editandoId) {
                await axios.put(`http://localhost:5274/pacientes/${editandoId}`, payload);
                notifica('Sucesso', 'Paciente atualizado com sucesso!', 'success');
            } else {
                await axios.post('http://localhost:5274/pacientes', payload);
                notifica('Sucesso', 'Paciente cadastrado com sucesso!', 'success');
            }
            resetarFormulario();
            carregarPacientes();
            setMostrarModal(false);
        } catch (error) {
            console.error('Erro ao salvar paciente:', error.response?.data || error.message);
            const msg = error.response?.data?.message || 'Erro ao salvar paciente';
            setErroMensagem(msg);
            notifica('Erro', msg, 'error');
        }
    };

    const resetarFormulario = () => {
        setNome('');
        setCpf('');
        setSexo('');
        setDataNascimento('');
        setEndereco({ cep: '', logradouro: '', bairro: '', localidade: '', complemento: '' });
        setEditandoId(null);
        setErroMensagem('');
    };

    const handleEditar = (paciente) => {
        setEditandoId(paciente.id);
        setNome(paciente.nome);
        setCpf(formatCPF(paciente.cpf));
        setSexo(paciente.sexo);
        setDataNascimento(paciente.dataNascimento.split('T')[0]);
        setEndereco({
            cep: paciente.cep,
            logradouro: paciente.endereco,
            bairro: paciente.bairro,
            localidade: paciente.cidade,
            complemento: paciente.complemento || ''
        });
        setErroMensagem('');
        setMostrarModal(true);
    };

    const handleExcluir = async (id) => {
        if (window.confirm('Deseja realmente excluir este paciente?')) {
            try {
                await axios.delete(`http://localhost:5274/pacientes/${id}`);
                notifica('Sucesso', 'Paciente excluído com sucesso!', 'success');
                carregarPacientes();
            } catch (error) {
                notifica('Erro', 'Erro ao excluir paciente', 'error');
            }
        }
    };

    const pacientesFiltrados = pacientes.filter(p =>
        p.nome.toLowerCase().includes(filtroNome.toLowerCase()) &&
        p.cpf.toLowerCase().includes(filtroCPF.toLowerCase())
    );

    return (
        <Container data-bs-theme="dark" fluid className="formContainer">
            <Row className="botaoContainer">
                <Button variant="secondary" onClick={() => navigate('/')}>
                    &larr; Voltar
                </Button>
                <Button variant="primary" onClick={() => { resetarFormulario(); setMostrarModal(true); }}>
                    Novo Cadastro
                </Button>
            </Row>

            <Modal show={mostrarModal} onHide={() => { setMostrarModal(false); resetarFormulario(); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editandoId ? 'Editar Paciente' : 'Cadastrar Paciente'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {erroMensagem && <div className="alert alert-danger">{erroMensagem}</div>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                value={nome}
                                onChange={limparErroAoDigitar(setNome)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Data de Nascimento</Form.Label>
                            <Form.Control
                                type="date"
                                value={dataNascimento}
                                onChange={limparErroAoDigitar(setDataNascimento)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>CPF</Form.Label>
                            <Form.Control
                                type="text"
                                value={cpf}
                                onChange={handleCPFChange}
                                maxLength={14}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Sexo</Form.Label>
                            <Form.Select
                                value={sexo}
                                onChange={(e) => { setSexo(e.target.value); setErroMensagem(''); }}
                                required
                            >
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>CEP</Form.Label>
                            <Form.Control
                                type="text"
                                value={endereco.cep}
                                onChange={cepChange}
                                maxLength={8}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Endereço</Form.Label>
                            <Form.Control
                                type="text"
                                value={endereco.logradouro}
                                onChange={(e) => { setEndereco(prev => ({ ...prev, logradouro: e.target.value })); setErroMensagem(''); }}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Bairro</Form.Label>
                            <Form.Control
                                type="text"
                                value={endereco.bairro}
                                onChange={(e) => { setEndereco(prev => ({ ...prev, bairro: e.target.value })); setErroMensagem(''); }}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cidade</Form.Label>
                            <Form.Control
                                type="text"
                                value={endereco.localidade}
                                onChange={(e) => { setEndereco(prev => ({ ...prev, localidade: e.target.value })); setErroMensagem(''); }}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Complemento</Form.Label>
                            <Form.Control
                                type="text"
                                value={endereco.complemento}
                                onChange={(e) => { setEndereco(prev => ({ ...prev, complemento: e.target.value })); setErroMensagem(''); }}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            {editandoId ? 'Salvar Alterações' : 'Cadastrar'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <InputGroup className="mb-3">
                <Form.Control
                    placeholder="Filtrar por nome"
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                />
                <Form.Control
                    placeholder="Filtrar por CPF"
                    value={filtroCPF}
                    onChange={(e) => setFiltroCPF(e.target.value)}
                />
            </InputGroup>

            <Table striped bordered hover responsive className="pacientes-table">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Data Nascimento</th>
                        <th>CPF</th>
                        <th>Sexo</th>
                        <th>Endereço</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {pacientesFiltrados.map(p => (
                        <tr key={p.id}>
                            <td>{p.nome}</td>
                            <td>{new Date(p.dataNascimento).toLocaleDateString()}</td>
                            <td>{formatCPF(p.cpf)}</td>
                            <td>{p.sexo}</td>
                            <td>{`${p.endereco}, ${p.bairro} - ${p.cidade}`}</td>
                            <td>
                                <Button variant="warning" size="sm" onClick={() => handleEditar(p)}>Editar</Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => handleExcluir(p.id)}>Excluir</Button>
                            </td>
                        </tr>
                    ))}
                    {pacientesFiltrados.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center">Nenhum paciente encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default Cadastro;
