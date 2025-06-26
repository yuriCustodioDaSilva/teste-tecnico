import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import md5 from 'js-md5'
import notifica from "../Components";
import './cadastro.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';


const Cadastro = ({ setAuthenticated }) => {
    const navigate = useNavigate();

    //cpf,senhaHash,nome,email,telefone,CEP
    const [mensagemDoc, setMensagemDoc] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senhaHash, setSenhaHash] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [CEP, setCEP] = useState('');
    const [dataNasc, setDataNasc] = useState('');
    const [status, setStatus] = useState(0);
    const [statusOptions, setStatusOptions] = useState([{ value: 0, label: 'Selecione' },{ value: 1, label: 'Ativo' }, { value: 2, label: 'Inativo' }, { value: 3, label: 'Pendente' }]);

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
        //     e.preventDefault(); 
        //     console.log("entro")
        //     if (cpf.replace(/\D/g, '').length != 11 && cpf.replace(/\D/g, '').length != 14) {
        //         notifica('CPF/CNPJ incorreto', 'É necessario um cpf/cnpj valido para poder processeguir com o cadastro', 'warning')
        //     } else if (nome.trim() == '') {
        //         notifica('Nome/Razão social incorreto', 'É necessario um nome/razão social valido para poder processeguir com o cadastro', 'warning')
        //     } else if (!email.trim().includes('@')) {
        //         notifica('Email incorreto', 'É necessario um email valido para poder prosseguir com o cadastro', 'warning')
        //     } else if (telefone.trim().length < 11) {
        //         notifica('Telefone incorreto', 'É necessario um telefone valido para poder processeguir com o cadastro.', 'warning')
        //     } else if (senhaHash.trim() == '') {
        //         notifica('Senha não informada', 'É necessario uma senha para poder processeguir com o cadastro.', 'warning')
        //     } else {
        //         try {
        //             e.preventDefault();
        //             let senha = md5(senhaHash)
        //             const response = await axios.post('http://localhost:4000/users', { cpf, senhaHash: senha, nome, email, telefone, CEP });
        //             // console.log(response)
        //             notifica('Cadastro realizado', 'Cadastro realizado com sucesso, faça login para poder continuar.', 'success')
        //             navigate('/Login')
        //         } catch (error) {
        //             console.error('Erro ao cadastrar usuário:', error);
        //         }
        //     }
    };
    const goLogin = (e) => {
        //     e.preventDefault()
        // navigate('/login')
    }
    return (
        <Container data-bs-theme="dark" fluid className="formContainer">
            <Row className="justify-content-center">
                <Col md={6}>
                    {/* <h1 className="text-center mb-4">Cadastro</h1> */}
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
                        <Form.Group className="mb-3" controlId="formCEP">
                            <Form.Label>Endereço</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Digite seu Endereço"
                                value={CEP}
                                onChange={(e) => setCEP(e.target.value)}
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
                    <a className="goLogin" onClick={goLogin}>Já tenho conta</a>
                </Col>
            </Row>
        </Container>
    );
};

export default Cadastro;
