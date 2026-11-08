CREATE DATABASE IF NOT EXISTS juriscontrol;

USE juriscontrol;

CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(30),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(30) NOT NULL UNIQUE,
    titulo VARCHAR(200) NOT NULL,
    area VARCHAR(100),
    status ENUM('Em andamento', 'Suspenso', 'Concluído')
        DEFAULT 'Em andamento',
    cliente_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_processo_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    responsavel VARCHAR(150),
    prazo DATE,
    prioridade ENUM('Baixa', 'Média', 'Alta') DEFAULT 'Média',
    situacao ENUM('Pendente', 'Em andamento', 'Concluída')
        DEFAULT 'Pendente',
    processo_id INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tarefa_processo
    FOREIGN KEY (processo_id) REFERENCES processos(id)
    ON DELETE SET NULL
);

ENGINE=InnoDB
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;