
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const conexao = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// ROTA INICIAL
app.get("/", (req, res) => {
  res.json({ mensagem: "API JurisControl funcionando!" });
});

// PAINEL
app.get("/painel", async (req, res) => {
  try {
    const [clientes] = await conexao.query(
      "SELECT COUNT(*) AS total FROM clientes"
    );
    const [processos] = await conexao.query(
      "SELECT COUNT(*) AS total FROM processos"
    );
    const [tarefas] = await conexao.query(
      "SELECT COUNT(*) AS total FROM tarefas"
    );
    const [pendentes] = await conexao.query(
      "SELECT COUNT(*) AS total FROM tarefas WHERE situacao = 'Pendente'"
    );
    const [concluidas] = await conexao.query(
      "SELECT COUNT(*) AS total FROM tarefas WHERE situacao = 'Concluída'"
    );

    res.json({
      clientes: clientes[0].total,
      processos: processos[0].total,
      tarefas: tarefas[0].total,
      pendentes: pendentes[0].total,
      concluidas: concluidas[0].total,
    });
  } catch (erro) {
    console.error("Erro no painel:", erro);
    res.status(500).json({ mensagem: "Erro ao carregar o painel." });
  }
});

// CLIENTES - LISTAR ATIVOS E INATIVOS
app.get("/clientes", async (req, res) => {
  try {
    const [resultado] = await conexao.query(
      "SELECT * FROM clientes ORDER BY id DESC"
    );
    res.json(resultado);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao listar clientes." });
  }
});

// CLIENTES - CADASTRAR
app.post("/clientes", async (req, res) => {
  try {
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        mensagem: "Nome e e-mail são obrigatórios.",
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO clientes (nome, email, telefone, ativo)
       VALUES (?, ?, ?, 1)`,
      [nome, email, telefone || null]
    );

    res.status(201).json({
      id: resultado.insertId,
      mensagem: "Cliente cadastrado com sucesso.",
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao cadastrar cliente." });
  }
});

// CLIENTES - EDITAR DADOS
app.put("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        mensagem: "Nome e e-mail são obrigatórios.",
      });
    }

    const [resultado] = await conexao.query(
      `UPDATE clientes
       SET nome = ?, email = ?, telefone = ?
       WHERE id = ?`,
      [nome, email, telefone || null, id]
    );

    if (resultado.affectedRows === 0) {
      const [existente] = await conexao.query(
        "SELECT id FROM clientes WHERE id = ?",
        [id]
      );

      if (existente.length === 0) {
        return res.status(404).json({ mensagem: "Cliente não encontrado." });
      }
    }

    res.json({ mensagem: "Cliente atualizado com sucesso." });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao atualizar cliente." });
  }
});

// CLIENTES - INATIVAR OU REATIVAR
app.patch("/clientes/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (ativo !== 0 && ativo !== 1 && ativo !== false && ativo !== true) {
      return res.status(400).json({
        mensagem: "Informe uma situação válida para o cliente.",
      });
    }

    const [resultado] = await conexao.query(
      "UPDATE clientes SET ativo = ? WHERE id = ?",
      [ativo ? 1 : 0, id]
    );

    if (resultado.affectedRows === 0) {
      const [existente] = await conexao.query(
        "SELECT id FROM clientes WHERE id = ?",
        [id]
      );

      if (existente.length === 0) {
        return res.status(404).json({ mensagem: "Cliente não encontrado." });
      }
    }

    res.json({
      mensagem: ativo
        ? "Cliente reativado com sucesso."
        : "Cliente inativado com sucesso.",
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao alterar situação do cliente." });
  }
});

// CLIENTES - EXCLUSÃO PROTEGIDA
// A exclusão definitiva foi substituída pela inativação.
app.delete("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await conexao.query(
      "UPDATE clientes SET ativo = 0 WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      const [existente] = await conexao.query(
        "SELECT id FROM clientes WHERE id = ?",
        [id]
      );

      if (existente.length === 0) {
        return res.status(404).json({ mensagem: "Cliente não encontrado." });
      }
    }

    res.json({ mensagem: "Cliente inativado. O histórico foi preservado." });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao inativar cliente." });
  }
});

// PROCESSOS - LISTAR
app.get("/processos", async (req, res) => {
  try {
    const [resultado] = await conexao.query(`
      SELECT
        processos.*,
        clientes.nome AS cliente_nome,
        clientes.ativo AS cliente_ativo
      FROM processos
      LEFT JOIN clientes ON processos.cliente_id = clientes.id
      ORDER BY processos.id DESC
    `);

    res.json(resultado);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao listar processos." });
  }
});

// PROCESSOS - CADASTRAR
app.post("/processos", async (req, res) => {
  try {
    const { numero, titulo, area, status, cliente_id } = req.body;

    if (!numero || !titulo || !cliente_id) {
      return res.status(400).json({
        mensagem: "Número, título e cliente são obrigatórios.",
      });
    }

    const [clientes] = await conexao.query(
      "SELECT id, ativo FROM clientes WHERE id = ?",
      [cliente_id]
    );

    if (clientes.length === 0) {
      return res.status(400).json({
        mensagem: "O cliente informado não existe.",
      });
    }

    if (clientes[0].ativo !== 1) {
      return res.status(400).json({
        mensagem: "Não é possível cadastrar um processo para um cliente inativo.",
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO processos
       (numero, titulo, area, status, cliente_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        numero,
        titulo,
        area || null,
        status || "Em andamento",
        cliente_id,
      ]
    );

    res.status(201).json({
      id: resultado.insertId,
      mensagem: "Processo cadastrado com sucesso.",
    });
  } catch (erro) {
    console.error(erro);

    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um processo com esse número.",
      });
    }

    if (erro.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        mensagem: "O cliente informado não existe.",
      });
    }

    res.status(500).json({ mensagem: "Erro ao cadastrar processo." });
  }
});

// PROCESSOS - EDITAR
app.put("/processos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, titulo, area, status, cliente_id } = req.body;

    if (!numero || !titulo || !cliente_id) {
      return res.status(400).json({
        mensagem: "Número, título e cliente são obrigatórios.",
      });
    }

    const [processosExistentes] = await conexao.query(
      "SELECT cliente_id FROM processos WHERE id = ?",
      [id]
    );

    if (processosExistentes.length === 0) {
      return res.status(404).json({
        mensagem: "Processo não encontrado.",
      });
    }

    const clienteAtual = processosExistentes[0].cliente_id;
    const [clientes] = await conexao.query(
      "SELECT id, ativo FROM clientes WHERE id = ?",
      [cliente_id]
    );

    if (clientes.length === 0) {
      return res.status(400).json({
        mensagem: "O cliente informado não existe.",
      });
    }

    // Permite manter o cliente inativo já vinculado ao processo,
    // mas não permite vinculá-lo a outro processo.
    if (clientes[0].ativo !== 1 && Number(cliente_id) !== Number(clienteAtual)) {
      return res.status(400).json({
        mensagem: "Não é possível vincular um cliente inativo a outro processo.",
      });
    }

    await conexao.query(
      `UPDATE processos
       SET numero = ?, titulo = ?, area = ?, status = ?, cliente_id = ?
       WHERE id = ?`,
      [
        numero,
        titulo,
        area || null,
        status || "Em andamento",
        cliente_id,
        id,
      ]
    );

    res.json({ mensagem: "Processo atualizado com sucesso." });
  } catch (erro) {
    console.error(erro);

    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Já existe um processo com esse número.",
      });
    }

    if (erro.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        mensagem: "O cliente informado não existe.",
      });
    }

    res.status(500).json({ mensagem: "Erro ao atualizar processo." });
  }
});

// PROCESSOS - EXCLUIR
app.delete("/processos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await conexao.query(
      "DELETE FROM processos WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Processo não encontrado.",
      });
    }

    res.json({ mensagem: "Processo excluído com sucesso." });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao excluir processo." });
  }
});

// TAREFAS - LISTAR
app.get("/tarefas", async (req, res) => {
  try {
    const [resultado] = await conexao.query(`
      SELECT
        tarefas.*,
        processos.numero AS processo_numero
      FROM tarefas
      LEFT JOIN processos ON tarefas.processo_id = processos.id
      ORDER BY tarefas.id DESC
    `);

    res.json(resultado);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao listar tarefas." });
  }
});

// TAREFAS - CADASTRAR
app.post("/tarefas", async (req, res) => {
  try {
    const {
      titulo, descricao, responsavel, prazo,
      prioridade, situacao, processo_id,
    } = req.body;

    if (!titulo) {
      return res.status(400).json({
        mensagem: "O título da tarefa é obrigatório.",
      });
    }

    const [resultado] = await conexao.query(
      `INSERT INTO tarefas
       (titulo, descricao, responsavel, prazo, prioridade, situacao, processo_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descricao || null,
        responsavel || null,
        prazo || null,
        prioridade || "Média",
        situacao || "Pendente",
        processo_id || null,
      ]
    );

    res.status(201).json({
      id: resultado.insertId,
      mensagem: "Tarefa cadastrada com sucesso.",
    });
  } catch (erro) {
    console.error(erro);

    if (erro.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        mensagem: "O processo informado não existe.",
      });
    }

    res.status(500).json({ mensagem: "Erro ao cadastrar tarefa." });
  }
});

// TAREFAS - EDITAR
app.put("/tarefas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo, descricao, responsavel, prazo,
      prioridade, situacao, processo_id,
    } = req.body;

    if (!titulo) {
      return res.status(400).json({
        mensagem: "O título da tarefa é obrigatório.",
      });
    }

    const [resultado] = await conexao.query(
      `UPDATE tarefas
       SET titulo = ?, descricao = ?, responsavel = ?, prazo = ?,
           prioridade = ?, situacao = ?, processo_id = ?
       WHERE id = ?`,
      [
        titulo,
        descricao || null,
        responsavel || null,
        prazo || null,
        prioridade || "Média",
        situacao || "Pendente",
        processo_id || null,
        id,
      ]
    );

    if (resultado.affectedRows === 0) {
      const [existente] = await conexao.query(
        "SELECT id FROM tarefas WHERE id = ?",
        [id]
      );

      if (existente.length === 0) {
        return res.status(404).json({
          mensagem: "Tarefa não encontrada.",
        });
      }
    }

    res.json({ mensagem: "Tarefa atualizada com sucesso." });
  } catch (erro) {
    console.error(erro);

    if (erro.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        mensagem: "O processo informado não existe.",
      });
    }

    res.status(500).json({ mensagem: "Erro ao atualizar tarefa." });
  }
});

// TAREFAS - EXCLUIR
app.delete("/tarefas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await conexao.query(
      "DELETE FROM tarefas WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Tarefa não encontrada.",
      });
    }

    res.json({ mensagem: "Tarefa excluída com sucesso." });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao excluir tarefa." });
  }
});

// INICIAR SERVIDOR
async function iniciarServidor() {
  try {
    const conexaoTeste = await conexao.getConnection();
    console.log("Conexão com MySQL estabelecida!");
    conexaoTeste.release();

    const PORTA = process.env.PORT || 3001;

    app.listen(PORTA, () => {
      console.log(`JurisControl disponível na porta ${PORTA}`);
    });
  } catch (erro) {
    console.error("Erro ao conectar com MySQL:", erro);
  }
}

iniciarServidor();
