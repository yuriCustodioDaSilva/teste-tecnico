import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import md5 from 'js-md5'
import notifica from "../Components";
import './styles.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';


const Cadastro = ({ setAuthenticated }) => {
    const navigate = useNavigate();

    const [mensagemDoc, setMensagemDoc] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [sexo, setSexo] = useState('');
    const [endereco, setEndereco] = useState('');
    const [dataNasc, setDataNasc] = useState('');
    const [status, setStatus] = useState(0);
    const [statusOptions, setStatusOptions] = useState([{ value: 0, label: 'Selecione' }, { value: 'Ativo', label: 'Ativo' }, { value: 'Inativo', label: 'Inativo' }, { value: 'Pendente', label: 'Pendente' }]);

    const formatarDocumento = (valor) => {
        const numeros = valor.replace(/\D/g, '');
        setMensagemDoc('')
        // CPF: 000.000.000-00
        const cpfFormatado = numeros
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        setMensagemDoc('Detectado: CPF');
        return cpfFormatado;
    };

    const detectarTipoDoc = (e) => {
        const valorFormatado = formatarDocumento(e.target.value);
        setCpf(valorFormatado);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // try {
        //     const response = await axios.post('http://localhost:5274/pacientes', {
        //         nome: nome,
        //         dataNascimento: dataNasc,
        //         cpf: cpf,
        //         sexo: sexo,
        //         endereco: endereco,
        //         status: status
        //     });
        //     console.log('Paciente criado:', response.data);
        // } catch (error) {
        //     console.error('Erro ao criar paciente:', error.message);
        // }
        navigate('/listagem');
    };

    const goLogin = (e) => {
        //     e.preventDefault()
        // navigate('/login')
    }

    return (
        <Container data-bs-theme="dark" fluid className="formContainer">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formNome">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formData">
                            <Form.Label>Data de Nascimento</Form.Label>
                            <Form.Control
                                type="date"
                                value={dataNasc}
                                onChange={(e) => setDataNasc(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formCpf">
                            <Form.Label>CPF</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu CPF"
                                value={cpf}
                                onChange={(e) => { setCpf(e.target.value); detectarTipoDoc(e); }}
                                maxLength={14}
                            />
                            {mensagemDoc && (
                                <Form.Text className="text-muted">
                                    {mensagemDoc}
                                </Form.Text>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formCpf">
                            <Form.Label>Sexo</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Sexo"
                                value={sexo}
                                onChange={(e) => { setSexo(e.target.value); detectarTipoDoc(e); }}
                                maxLength={14}
                            />
                            {mensagemDoc && (
                                <Form.Text className="text-muted">
                                    {mensagemDoc}
                                </Form.Text>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formCEP">
                            <Form.Label>Endereço</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu Endereço"
                                value={endereco}
                                onChange={(e) => setEndereco(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formStatus">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="d-grid">
                            <Button variant="dark" type="submit">
                                Cadastrar
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Cadastro;
