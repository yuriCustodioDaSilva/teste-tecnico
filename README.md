
# Teste Técnico — Clínica ACME

Aplicação fullstack para gerenciamento de pacientes e atendimentos. Utiliza **ASP.NET Core** no backend com **Entity Framework Core (SQLite)** e **React** no frontend.

---

## Estrutura do Projeto

```
teste-tecnico/
├── backend/               # Projeto ASP.NET Core
│   ├── Controllers/       # Endpoints da API
│   ├── Data/              # DbContext e configuração do banco
│   ├── Models/            # Entidades do domínio
│   ├── Migrations/        # Migrações EF Core
│   ├── appsettings.json   # Configurações de ambiente
├── src/                   # Código-fonte React
├── public/                # Arquivos estáticos React
├── package.json           # Dependências frontend
├── clinica-acme.sln       # Solução do projeto
```

---

## Requisitos

- .NET 6 SDK  
  [https://dotnet.microsoft.com/en-us/download/dotnet/6.0](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
- Node.js (v18+)  
  [https://nodejs.org/](https://nodejs.org/)
- EF Core CLI  
  [https://learn.microsoft.com/en-us/ef/core/cli/dotnet](https://learn.microsoft.com/en-us/ef/core/cli/dotnet)  

Para instalar o EF Core CLI:

```bash
dotnet tool install --global dotnet-ef
```

---

## Como executar

1. Clonar o projeto

```bash
git clone https://github.com/seu-usuario/teste-tecnico.git
cd teste-tecnico
```

2. Instalar dependências do frontend

```bash
npm install
```

3. Backend

```bash
cd backend
dotnet ef migrations add Inicial
dotnet ef database update
dotnet watch run
```

A API estará disponível em:  
`http://localhost:5274/`

4. Frontend

Na raiz do projeto (onde está o package.json), rodar:

```bash
npm start
```

O frontend estará disponível em:  
`http://localhost:3000`