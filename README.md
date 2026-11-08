# ⚖️ JurisControl

**Sistema de gerenciamento para escritórios de advocacia.**

O JurisControl é uma aplicação web desenvolvida para auxiliar na organização e no gerenciamento das atividades de um escritório de advocacia, centralizando informações de clientes, processos jurídicos, tarefas e compromissos em uma única plataforma.

O projeto foi desenvolvido como iniciativa acadêmica e prática de desenvolvimento de software, com foco na aplicação de tecnologias utilizadas no desenvolvimento web.

## 📌 Funcionalidades

### Painel inicial
- Visualização geral dos dados cadastrados.
- Indicadores de clientes, processos e tarefas.
- Acompanhamento de tarefas pendentes e concluídas.

### Gestão de clientes
- Cadastro de clientes.
- Listagem e edição de informações.
- Inativação e reativação de clientes.
- Preservação do histórico de clientes inativados.

### Gestão de processos
- Cadastro de processos jurídicos.
- Associação de processos aos clientes.
- Registro de número, título e área jurídica.
- Acompanhamento da situação dos processos.

### Gestão de tarefas
- Cadastro e edição de tarefas.
- Definição de responsáveis e prazos.
- Classificação por prioridade.
- Controle de situação das tarefas.
- Associação opcional a processos.

### Agenda
- Visualização de compromissos e prazos.
- Organização das tarefas em calendário.

## 🛠️ Tecnologias utilizadas

**Frontend**
- React
- JavaScript
- Vite
- CSS
- Lucide React

**Backend**
- Node.js
- Express
- MySQL2
- Dotenv

**Banco de dados**
- MySQL

**Ferramentas**
- Visual Studio Code
- Git
- GitHub
- MySQL Workbench

## 📁 Estrutura do projeto

```text
JurisControl/
│
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── schema.sql
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Como executar o projeto

### 1. Pré-requisitos

Antes de começar, instale:

- [Node.js](https://nodejs.org/)
- [MySQL](https://dev.mysql.com/downloads/installer/)
- [Git](https://git-scm.com/)

### 2. Clonar o repositório

```bash
git clone https://github.com/rebeca-vital/JurisControl.git
```

Entre na pasta:

```bash
cd JurisControl
```

### 3. Configurar o banco de dados

Abra o MySQL Workbench e execute o arquivo:

```text
backend/schema.sql
```

O script cria o banco de dados `juriscontrol` e as tabelas necessárias para o funcionamento da aplicação.

### 4. Configurar o backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie seu arquivo de configuração local a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Abra o arquivo `.env` e configure os dados da sua instalação do MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=juriscontrol
PORT=3001
```

**Importante:** utilize suas próprias credenciais locais. O arquivo `.