
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, BriefcaseBusiness, ClipboardList,
  CalendarDays, Search, Bell, Plus, Pencil, Trash2, X,
  ChevronDown, Menu, FileText, Clock3, CheckCircle2,
  AlertCircle, ArrowUpRight, Archive, RotateCcw
} from "lucide-react";
import Agenda from "./Agenda";
import "./App.css";

const API = "http://localhost:3001";

const tarefaInicial = {
  titulo: "",
  descricao: "",
  responsavel: "",
  prazo: "",
  prioridade: "Média",
  situacao: "Pendente",
  processo_id: ""
};

function App() {
  const [pagina, setPagina] = useState("painel");
  const [menuAberto, setMenuAberto] = useState(false);

  const [painel, setPainel] = useState({
    clientes: 0, processos: 0, tarefas: 0,
    pendentes: 0, concluidas: 0
  });

  const [clientes, setClientes] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [tarefas, setTarefas] = useState([]);

  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [filtroClientes, setFiltroClientes] = useState("ativos");

  const [modalCliente, setModalCliente] = useState(false);
  const [modalProcesso, setModalProcesso] = useState(false);
  const [modalTarefa, setModalTarefa] = useState(false);

  const [clienteEditando, setClienteEditando] = useState(null);
  const [processoEditando, setProcessoEditando] = useState(null);
  const [tarefaEditando, setTarefaEditando] = useState(null);

  const [formCliente, setFormCliente] = useState({
    nome: "", email: "", telefone: ""
  });

  const [formProcesso, setFormProcesso] = useState({
    numero: "", titulo: "", area: "",
    status: "Em andamento", cliente_id: ""
  });

  const [formTarefa, setFormTarefa] = useState(tarefaInicial);

  useEffect(() => {
    carregarDados();
  }, []);

  async function requisicao(url, opcoes = {}) {
    const resposta = await fetch(`${API}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...opcoes
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.mensagem || "Não foi possível realizar a operação.");
    }

    return dados;
  }

  async function carregarDados() {
    try {
      const [dadosPainel, dadosClientes, dadosProcessos, dadosTarefas] =
        await Promise.all([
          requisicao("/painel"),
          requisicao("/clientes"),
          requisicao("/processos"),
          requisicao("/tarefas")
        ]);

      setPainel(dadosPainel);
      setClientes(dadosClientes);
      setProcessos(dadosProcessos);
      setTarefas(dadosTarefas);
      setErro("");
    } catch (error) {
      setErro("Não foi possível carregar os dados. Verifique o servidor.");
      console.error(error);
    }
  }

  function notificar(texto) {
    setMensagem(texto);
    setTimeout(() => setMensagem(""), 3500);
  }

  function formatarData(data) {
    if (!data) return "—";
    return new Date(`${String(data).slice(0, 10)}T00:00:00`)
      .toLocaleDateString("pt-BR");
  }

  function navegar(destino) {
    setPagina(destino);
    setBusca("");
    setMenuAberto(false);
  }

  // CLIENTES

  const clientesAtivos = clientes.filter(
    cliente => Number(cliente.ativo) === 1
  );

  const clientesInativos = clientes.filter(
    cliente => Number(cliente.ativo) === 0
  );

  const clientesDaVisualizacao = filtroClientes === "ativos"
    ? clientesAtivos
    : clientesInativos;

  const clientesFiltrados = clientesDaVisualizacao.filter((cliente) =>
    `${cliente.nome} ${cliente.email || ""} ${cliente.telefone || ""}`
      .toLowerCase().includes(busca.toLowerCase())
  );

  function abrirNovoCliente() {
    setClienteEditando(null);
    setFormCliente({ nome: "", email: "", telefone: "" });
    setModalCliente(true);
  }

  function abrirEditarCliente(cliente) {
    setClienteEditando(cliente);
    setFormCliente({
      nome: cliente.nome || "",
      email: cliente.email || "",
      telefone: cliente.telefone || ""
    });
    setModalCliente(true);
  }

  async function salvarCliente(evento) {
    evento.preventDefault();

    try {
      const url = clienteEditando
        ? `/clientes/${clienteEditando.id}`
        : "/clientes";

      await requisicao(url, {
        method: clienteEditando ? "PUT" : "POST",
        body: JSON.stringify(formCliente)
      });

      setModalCliente(false);
      await carregarDados();

      notificar(clienteEditando
        ? "Cliente atualizado com sucesso."
        : "Cliente cadastrado com sucesso.");
    } catch (error) {
      notificar(error.message);
    }
  }

  async function alterarStatusCliente(id, ativo) {
    const acao = ativo ? "reativar" : "inativar";

    const confirmacao = ativo
      ? "Deseja reativar este cliente? Ele poderá ser vinculado a novos processos."
      : "Deseja inativar este cliente? O cadastro e o histórico dos processos serão preservados.";

    if (!window.confirm(confirmacao)) return;

    try {
      const resposta = await requisicao(`/clientes/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ ativo })
      });

      await carregarDados();
      notificar(resposta.mensagem || `Cliente ${acao}do com sucesso.`);
    } catch (error) {
      notificar(error.message);
    }
  }

  // PROCESSOS

  function abrirNovoProcesso() {
    if (clientesAtivos.length === 0) {
      notificar("Cadastre ou reative um cliente antes de criar um processo.");
      return;
    }

    setProcessoEditando(null);
    setFormProcesso({
      numero: "", titulo: "", area: "",
      status: "Em andamento", cliente_id: ""
    });
    setModalProcesso(true);
  }

  function abrirEditarProcesso(processo) {
    setProcessoEditando(processo);
    setFormProcesso({
      numero: processo.numero || "",
      titulo: processo.titulo || "",
      area: processo.area || "",
      status: processo.status || "Em andamento",
      cliente_id: String(processo.cliente_id || "")
    });
    setModalProcesso(true);
  }

  async function salvarProcesso(evento) {
    evento.preventDefault();

    try {
      const url = processoEditando
        ? `/processos/${processoEditando.id}`
        : "/processos";

      await requisicao(url, {
        method: processoEditando ? "PUT" : "POST",
        body: JSON.stringify({
          ...formProcesso,
          cliente_id: Number(formProcesso.cliente_id)
        })
      });

      setModalProcesso(false);
      await carregarDados();

      notificar(processoEditando
        ? "Processo atualizado com sucesso."
        : "Processo cadastrado com sucesso.");
    } catch (error) {
      notificar(error.message);
    }
  }

  async function excluirProcesso(id) {
    if (!window.confirm("Deseja realmente excluir este processo?")) return;

    try {
      await requisicao(`/processos/${id}`, { method: "DELETE" });
      await carregarDados();
      notificar("Processo excluído com sucesso.");
    } catch (error) {
      notificar(error.message);
    }
  }

  // TAREFAS

  function abrirNovaTarefa() {
    setTarefaEditando(null);
    setFormTarefa(tarefaInicial);
    setModalTarefa(true);
  }

  function abrirEditarTarefa(tarefa) {
    setTarefaEditando(tarefa);
    setFormTarefa({
      titulo: tarefa.titulo || "",
      descricao: tarefa.descricao || "",
      responsavel: tarefa.responsavel || "",
      prazo: tarefa.prazo
        ? String(tarefa.prazo).slice(0, 10)
        : "",
      prioridade: tarefa.prioridade || "Média",
      situacao: tarefa.situacao || "Pendente",
      processo_id: tarefa.processo_id
        ? String(tarefa.processo_id)
        : ""
    });
    setModalTarefa(true);
  }

  async function salvarTarefa(evento) {
    evento.preventDefault();

    try {
      const url = tarefaEditando
        ? `/tarefas/${tarefaEditando.id}`
        : "/tarefas";

      const dados = {
        ...formTarefa,
        processo_id: formTarefa.processo_id
          ? Number(formTarefa.processo_id)
          : null,
        prazo: formTarefa.prazo || null
      };

      await requisicao(url, {
        method: tarefaEditando ? "PUT" : "POST",
        body: JSON.stringify(dados)
      });

      setModalTarefa(false);
      await carregarDados();

      notificar(tarefaEditando
        ? "Tarefa atualizada com sucesso."
        : "Tarefa cadastrada com sucesso.");
    } catch (error) {
      notificar(error.message);
    }
  }

  async function excluirTarefa(id) {
    if (!window.confirm("Deseja realmente excluir esta tarefa?")) return;

    try {
      await requisicao(`/tarefas/${id}`, { method: "DELETE" });
      await carregarDados();
      notificar("Tarefa excluída com sucesso.");
    } catch (error) {
      notificar(error.message);
    }
  }

  const processosFiltrados = processos.filter((processo) =>
    `${processo.numero} ${processo.titulo} ${processo.cliente_nome || ""}`
      .toLowerCase().includes(busca.toLowerCase())
  );

  const tarefasFiltradas = tarefas.filter((tarefa) =>
    `${tarefa.titulo} ${tarefa.responsavel || ""} ${tarefa.processo_numero || ""} ${tarefa.situacao}`
      .toLowerCase().includes(busca.toLowerCase())
  );

  function classeSituacao(situacao) {
    if (situacao === "Concluída" || situacao === "Concluído") return "concluido";
    if (situacao === "Em andamento") return "andamento";
    return "suspenso";
  }

  function classePrioridade(prioridade) {
    if (prioridade === "Alta") return "prioridade-alta";
    if (prioridade === "Baixa") return "prioridade-baixa";
    return "prioridade-media";
  }

  return (
    <div className="sistema">

      <aside className={`sidebar ${menuAberto ? "sidebar-aberta" : ""}`}>
        <div className="marca">
          <div className="marca-icone">
            <BriefcaseBusiness size={23} />
          </div>
          <div>
            <h2>JurisControl</h2>
            <span>Gestão e organização</span>
          </div>
        </div>

        <div className="menu-titulo">MENU PRINCIPAL</div>

        <nav className="navegacao">
          {[
            ["painel", LayoutDashboard, "Painel"],
            ["clientes", Users, "Clientes"],
            ["processos", BriefcaseBusiness, "Processos"],
            ["tarefas", ClipboardList, "Tarefas"],
            ["agenda", CalendarDays, "Agenda"]
          ].map(([destino, Icone, titulo]) => (
            <button
              key={destino}
              className={pagina === destino ? "ativo" : ""}
              onClick={() => navegar(destino)}
            >
              <Icone size={19} />
              <span>{titulo}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-rodape">
          <div className="perfil-mini">
            <div className="avatar">AD</div>
            <div>
              <strong>Administrador</strong>
              <span>Gestão do sistema</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="conteudo">
        <header className="topbar">
          <button
            className="botao-menu-mobile"
            onClick={() => setMenuAberto(!menuAberto)}
          >
            <Menu size={21} />
          </button>

          <div className="caminho">
            <span>JurisControl</span>
            <span className="separador">/</span>
            <strong>
              {pagina === "painel" && "Painel"}
              {pagina === "clientes" && "Clientes"}
              {pagina === "processos" && "Processos"}
              {pagina === "tarefas" && "Tarefas"}
              {pagina === "agenda" && "Agenda"}
            </strong>
          </div>

          <div className="topbar-direita">
            <div className="status-conexao">
              <span className="ponto-verde"></span>
              Sistema conectado
            </div>
            <button className="icone-topbar" title="Notificações">
              <Bell size={19} />
            </button>
            <div className="avatar-topo">AD</div>
          </div>
        </header>

        <section className="pagina">
          {erro && <div className="aviso-erro">{erro}</div>}

          {mensagem && (
            <div className="notificacao">
              <CheckCircle2 size={18} />
              {mensagem}
            </div>
          )}

          {/* PAINEL */}

          {pagina === "painel" && (
            <>
              <div className="cabecalho-pagina">
                <div>
                  <span className="subtitulo">VISÃO GERAL</span>
                  <h1>Painel de controle</h1>
                  <p>Acompanhe as informações e atividades do sistema.</p>
                </div>
                <button className="botao-secundario" onClick={carregarDados}>
                  Atualizar dados
                </button>
              </div>

              <div className="grade-indicadores">
                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Clientes cadastrados</span>
                    <div className="indicador-icone azul"><Users size={20} /></div>
                  </div>
                  <strong>{painel.clientes}</strong>
                  <small>Registros no sistema</small>
                </div>

                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Processos</span>
                    <div className="indicador-icone laranja"><BriefcaseBusiness size={20} /></div>
                  </div>
                  <strong>{painel.processos}</strong>
                  <small>Processos cadastrados</small>
                </div>

                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Tarefas pendentes</span>
                    <div className="indicador-icone amarelo"><Clock3 size={20} /></div>
                  </div>
                  <strong>{painel.pendentes}</strong>
                  <small>Aguardando conclusão</small>
                </div>

                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Tarefas concluídas</span>
                    <div className="indicador-icone verde"><CheckCircle2 size={20} /></div>
                  </div>
                  <strong>{painel.concluidas}</strong>
                  <small>Finalizadas</small>
                </div>
              </div>

              <div className="painel-duas-colunas">
                <div className="cartao">
                  <div className="cartao-cabecalho">
                    <div>
                      <h3>Atividades recentes</h3>
                      <p>Últimos registros de processos</p>
                    </div>
                    <button className="link-acao" onClick={() => navegar("processos")}>
                      Ver processos <ArrowUpRight size={15} />
                    </button>
                  </div>

                  {processos.length === 0 ? (
                    <div className="estado-vazio">
                      <FileText size={30} />
                      <strong>Nenhum processo cadastrado</strong>
                      <span>Os novos registros aparecerão aqui.</span>
                    </div>
                  ) : (
                    <div className="lista-atividades">
                      {processos.slice(0, 5).map((processo) => (
                        <div className="atividade" key={processo.id}>
                          <div className="atividade-icone"><BriefcaseBusiness size={17} /></div>
                          <div className="atividade-info">
                            <strong>{processo.titulo}</strong>
                            <span>{processo.numero} · {processo.cliente_nome}</span>
                          </div>
                          <span className={`etiqueta ${classeSituacao(processo.status)}`}>
                            {processo.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cartao resumo-cartao">
                  <div className="cartao-cabecalho">
                    <div>
                      <h3>Resumo das tarefas</h3>
                      <p>Situação atual</p>
                    </div>
                    <ClipboardList size={21} />
                  </div>

                  <div className="resumo-numero">
                    <strong>{painel.tarefas}</strong>
                    <span>tarefas registradas</span>
                  </div>

                  <div className="barra-progresso">
                    <div style={{
                      width: painel.tarefas
                        ? `${(painel.concluidas / painel.tarefas) * 100}%`
                        : "0%"
                    }}></div>
                  </div>

                  <div className="resumo-legenda">
                    <span><i className="legenda-verde"></i> Concluídas: {painel.concluidas}</span>
                    <span><i className="legenda-amarela"></i> Pendentes: {painel.pendentes}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CLIENTES */}

          {pagina === "clientes" && (
            <>
              <div className="cabecalho-pagina">
                <div>
                  <span className="subtitulo">CADASTROS</span>
                  <h1>Clientes</h1>
                  <p>Gerencie os cadastros e acompanhe a situação dos clientes.</p>
                </div>
                <button className="botao-principal" onClick={abrirNovoCliente}>
                  <Plus size={18} /> Novo cliente
                </button>
              </div>

              <div className="cartao">
                <div className="ferramentas-tabela">
                  <div className="total-registros">
                    <strong>{clientesFiltrados.length}</strong>
                    <span>
                      {filtroClientes === "ativos" ? "clientes ativos" : "clientes inativos"}
                    </span>
                  </div>

                  <div className="campo-busca">
                    <Search size={18} />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar cliente..."
                    />
                  </div>
                </div>

                <div className="ferramentas-tabela">
                  <div className="acoes">
                    <button
                      className={filtroClientes === "ativos" ? "botao-principal" : "botao-secundario"}
                      onClick={() => {
                        setFiltroClientes("ativos");
                        setBusca("");
                      }}
                    >
                      <Users size={16} /> Ativos ({clientesAtivos.length})
                    </button>

                    <button
                      className={filtroClientes === "inativos" ? "botao-principal" : "botao-secundario"}
                      onClick={() => {
                        setFiltroClientes("inativos");
                        setBusca("");
                      }}
                    >
                      <Archive size={16} /> Inativos ({clientesInativos.length})
                    </button>
                  </div>
                </div>

                <div className="tabela-responsiva">
                  <table>
                    <thead>
                      <tr>
                        <th>CLIENTE</th>
                        <th>E-MAIL</th>
                        <th>TELEFONE</th>
                        <th>CADASTRO</th>
                        <th>SITUAÇÃO</th>
                        <th>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientesFiltrados.map((cliente) => (
                        <tr key={cliente.id}>
                          <td>
                            <div className="nome-tabela">
                              <div className="avatar-cliente">
                                {cliente.nome?.charAt(0).toUpperCase()}
                              </div>
                              <strong>{cliente.nome}</strong>
                            </div>
                          </td>
                          <td>{cliente.email || "—"}</td>
                          <td>{cliente.telefone || "—"}</td>
                          <td>{formatarData(cliente.criado_em)}</td>
                          <td>
                            <span className={`etiqueta ${Number(cliente.ativo) === 1 ? "andamento" : "suspenso"}`}>
                              {Number(cliente.ativo) === 1 ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td>
                            <div className="acoes">
                              <button
                                className="acao-editar"
                                onClick={() => abrirEditarCliente(cliente)}
                                title="Editar cliente"
                              >
                                <Pencil size={16} />
                              </button>

                              {Number(cliente.ativo) === 1 ? (
                                <button
                                  className="acao-excluir"
                                  onClick={() => alterarStatusCliente(cliente.id, false)}
                                  title="Inativar cliente"
                                >
                                  <Archive size={16} />
                                </button>
                              ) : (
                                <button
                                  className="acao-editar"
                                  onClick={() => alterarStatusCliente(cliente.id, true)}
                                  title="Reativar cliente"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {clientesFiltrados.length === 0 && (
                        <tr>
                          <td colSpan="6" className="tabela-vazia">
                            {filtroClientes === "ativos"
                              ? "Nenhum cliente ativo encontrado."
                              : "Nenhum cliente inativo encontrado."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* PROCESSOS */}

          {pagina === "processos" && (
            <>
              <div className="cabecalho-pagina">
                <div>
                  <span className="subtitulo">GESTÃO JURÍDICA</span>
                  <h1>Processos</h1>
                  <p>Organize e acompanhe os processos vinculados aos clientes.</p>
                </div>
                <button
                  className="botao-principal"
                  onClick={abrirNovoProcesso}
                  disabled={clientesAtivos.length === 0}
                >
                  <Plus size={18} /> Novo processo
                </button>
              </div>

              {clientesAtivos.length === 0 && (
                <div className="aviso-informativo">
                  <AlertCircle size={18} />
                  Não há clientes ativos. Cadastre um novo cliente ou reative um cadastro existente para criar processos.
                </div>
              )}

              <div className="cartao">
                <div className="ferramentas-tabela">
                  <div className="total-registros">
                    <strong>{processos.length}</strong>
                    <span>processos cadastrados</span>
                  </div>
                  <div className="campo-busca">
                    <Search size={18} />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar processo ou cliente..."
                    />
                  </div>
                </div>

                <div className="tabela-responsiva">
                  <table>
                    <thead>
                      <tr>
                        <th>NÚMERO</th>
                        <th>PROCESSO</th>
                        <th>CLIENTE</th>
                        <th>ÁREA</th>
                        <th>SITUAÇÃO</th>
                        <th>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processosFiltrados.map((processo) => (
                        <tr key={processo.id}>
                          <td><strong>{processo.numero}</strong></td>
                          <td>{processo.titulo}</td>
                          <td>
                            {processo.cliente_nome}
                            {Number(processo.cliente_ativo) === 0 && (
                              <span className="etiqueta suspenso" style={{ marginLeft: "6px" }}>
                                Inativo
                              </span>
                            )}
                          </td>
                          <td>{processo.area || "—"}</td>
                          <td>
                            <span className={`etiqueta ${classeSituacao(processo.status)}`}>
                              {processo.status}
                            </span>
                          </td>
                          <td>
                            <div className="acoes">
                              <button
                                className="acao-editar"
                                onClick={() => abrirEditarProcesso(processo)}
                                title="Editar"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="acao-excluir"
                                onClick={() => excluirProcesso(processo.id)}
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {processosFiltrados.length === 0 && (
                        <tr>
                          <td colSpan="6" className="tabela-vazia">
                            Nenhum processo encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAREFAS */}

          {pagina === "tarefas" && (
            <>
              <div className="cabecalho-pagina">
                <div>
                  <span className="subtitulo">ORGANIZAÇÃO</span>
                  <h1>Tarefas</h1>
                  <p>Gerencie atividades, responsáveis e prazos.</p>
                </div>
                <button className="botao-principal" onClick={abrirNovaTarefa}>
                  <Plus size={18} /> Nova tarefa
                </button>
              </div>

              <div className="grade-indicadores">
                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Total de tarefas</span>
                    <div className="indicador-icone azul"><ClipboardList size={20} /></div>
                  </div>
                  <strong>{tarefas.length}</strong>
                  <small>Atividades cadastradas</small>
                </div>

                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Pendentes</span>
                    <div className="indicador-icone amarelo"><Clock3 size={20} /></div>
                  </div>
                  <strong>{tarefas.filter(t => t.situacao === "Pendente").length}</strong>
                  <small>Aguardando início</small>
                </div>

                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Em andamento</span>
                    <div className="indicador-icone laranja"><ArrowUpRight size={20} /></div>
                  </div>
                  <strong>{tarefas.filter(t => t.situacao === "Em andamento").length}</strong>
                  <small>Em execução</small>
                </div>

                <div className="indicador">
                  <div className="indicador-topo">
                    <span>Concluídas</span>
                    <div className="indicador-icone verde"><CheckCircle2 size={20} /></div>
                  </div>
                  <strong>{tarefas.filter(t => t.situacao === "Concluída").length}</strong>
                  <small>Finalizadas</small>
                </div>
              </div>

              <div className="cartao">
                <div className="ferramentas-tabela">
                  <div className="total-registros">
                    <strong>{tarefas.length}</strong>
                    <span>tarefas registradas</span>
                  </div>
                  <div className="campo-busca">
                    <Search size={18} />
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar tarefa ou responsável..."
                    />
                  </div>
                </div>

                <div className="tabela-responsiva">
                  <table>
                    <thead>
                      <tr>
                        <th>TAREFA</th>
                        <th>RESPONSÁVEL</th>
                        <th>PROCESSO</th>
                        <th>PRAZO</th>
                        <th>PRIORIDADE</th>
                        <th>SITUAÇÃO</th>
                        <th>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tarefasFiltradas.map((tarefa) => (
                        <tr key={tarefa.id}>
                          <td>
                            <strong>{tarefa.titulo}</strong>
                            {tarefa.descricao && (
                              <div style={{ fontSize: "12px", color: "#778399", marginTop: "4px" }}>
                                {tarefa.descricao}
                              </div>
                            )}
                          </td>
                          <td>{tarefa.responsavel || "—"}</td>
                          <td>{tarefa.processo_numero || "—"}</td>
                          <td>{formatarData(tarefa.prazo)}</td>
                          <td>
                            <span className={`etiqueta ${classePrioridade(tarefa.prioridade)}`}>
                              {tarefa.prioridade}
                            </span>
                          </td>
                          <td>
                            <span className={`etiqueta ${classeSituacao(tarefa.situacao)}`}>
                              {tarefa.situacao}
                            </span>
                          </td>
                          <td>
                            <div className="acoes">
                              <button
                                className="acao-editar"
                                onClick={() => abrirEditarTarefa(tarefa)}
                                title="Editar"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                className="acao-excluir"
                                onClick={() => excluirTarefa(tarefa.id)}
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {tarefasFiltradas.length === 0 && (
                        <tr>
                          <td colSpan="7" className="tabela-vazia">
                            Nenhuma tarefa cadastrada. Clique em "Nova tarefa" para começar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* AGENDA */}

          {pagina === "agenda" && (
            <>
              <div className="cabecalho-pagina">
                <div>
                  <span className="subtitulo">COMPROMISSOS</span>
                  <h1>Agenda</h1>
                  <p>Visualize as tarefas e acompanhe os prazos em um calendário mensal.</p>
                </div>
              </div>

              <Agenda
                tarefas={tarefas}
                formatarData={formatarData}
                classeSituacao={classeSituacao}
                aoEditar={abrirEditarTarefa}
              />
            </>
          )}
        </section>
      </main>

      {/* MODAL CLIENTE */}

      {modalCliente && (
        <div className="fundo-modal" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setModalCliente(false);
        }}>
          <div className="modal">
            <div className="modal-cabecalho">
              <div>
                <span className="subtitulo">CADASTROS</span>
                <h2>{clienteEditando ? "Editar cliente" : "Novo cliente"}</h2>
              </div>
              <button className="fechar-modal" onClick={() => setModalCliente(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarCliente}>
              <label>Nome completo *</label>
              <input
                required
                value={formCliente.nome}
                onChange={(e) => setFormCliente({ ...formCliente, nome: e.target.value })}
                placeholder="Ex.: João da Silva"
              />

              <label>E-mail</label>
              <input
                type="email"
                value={formCliente.email}
                onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                placeholder="cliente@email.com"
              />

              <label>Telefone</label>
              <input
                value={formCliente.telefone}
                onChange={(e) => setFormCliente({ ...formCliente, telefone: e.target.value })}
                placeholder="(85) 99999-9999"
              />

              <div className="modal-acoes">
                <button type="button" className="botao-secundario" onClick={() => setModalCliente(false)}>
                  Cancelar
                </button>
                <button type="submit" className="botao-principal">
                  {clienteEditando ? "Salvar alterações" : "Cadastrar cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROCESSO */}

      {modalProcesso && (
        <div className="fundo-modal" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setModalProcesso(false);
        }}>
          <div className="modal">
            <div className="modal-cabecalho">
              <div>
                <span className="subtitulo">GESTÃO JURÍDICA</span>
                <h2>{processoEditando ? "Editar processo" : "Novo processo"}</h2>
              </div>
              <button className="fechar-modal" onClick={() => setModalProcesso(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarProcesso}>
              <label>Número do processo *</label>
              <input
                required
                value={formProcesso.numero}
                onChange={(e) => setFormProcesso({ ...formProcesso, numero: e.target.value })}
                placeholder="Ex.: 0001234-56.2026.8.06.0001"
              />

              <label>Título *</label>
              <input
                required
                value={formProcesso.titulo}
                onChange={(e) => setFormProcesso({ ...formProcesso, titulo: e.target.value })}
                placeholder="Ex.: Ação de cobrança"
              />

              <label>Área jurídica</label>
              <select
                value={formProcesso.area}
                onChange={(e) => setFormProcesso({ ...formProcesso, area: e.target.value })}
              >
                <option value="">Selecione a área</option>
                <option value="Cível">Cível</option>
                <option value="Trabalhista">Trabalhista</option>
                <option value="Família">Família</option>
                <option value="Consumidor">Consumidor</option>
                <option value="Previdenciária">Previdenciária</option>
                <option value="Criminal">Criminal</option>
                <option value="Tributária">Tributária</option>
              </select>

              <label>Cliente vinculado *</label>
              <select
                required
                value={formProcesso.cliente_id}
                onChange={(e) => setFormProcesso({ ...formProcesso, cliente_id: e.target.value })}
              >
                <option value="">Selecione um cliente</option>

                {clientesAtivos.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}

                {processoEditando &&
                  Number(processoEditando.cliente_ativo) === 0 &&
                  !clientesAtivos.some(
                    cliente => String(cliente.id) === formProcesso.cliente_id
                  ) && (
                    <option value={formProcesso.cliente_id}>
                      {processoEditando.cliente_nome} (inativo — vínculo atual)
                    </option>
                  )}
              </select>

              <label>Situação</label>
              <select
                value={formProcesso.status}
                onChange={(e) => setFormProcesso({ ...formProcesso, status: e.target.value })}
              >
                <option value="Em andamento">Em andamento</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Concluído">Concluído</option>
              </select>

              <div className="modal-acoes">
                <button type="button" className="botao-secundario" onClick={() => setModalProcesso(false)}>
                  Cancelar
                </button>
                <button type="submit" className="botao-principal">
                  {processoEditando ? "Salvar alterações" : "Cadastrar processo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAREFA */}

      {modalTarefa && (
        <div className="fundo-modal" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setModalTarefa(false);
        }}>
          <div className="modal">
            <div className="modal-cabecalho">
              <div>
                <span className="subtitulo">ORGANIZAÇÃO</span>
                <h2>{tarefaEditando ? "Editar tarefa" : "Nova tarefa"}</h2>
              </div>
              <button className="fechar-modal" onClick={() => setModalTarefa(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={salvarTarefa}>
              <label>Título da tarefa *</label>
              <input
                required
                value={formTarefa.titulo}
                onChange={(e) => setFormTarefa({ ...formTarefa, titulo: e.target.value })}
                placeholder="Ex.: Analisar documentação do processo"
              />

              <label>Descrição</label>
              <textarea
                value={formTarefa.descricao}
                onChange={(e) => setFormTarefa({ ...formTarefa, descricao: e.target.value })}
                placeholder="Detalhes da atividade..."
                rows="3"
              />

              <label>Responsável</label>
              <input
                value={formTarefa.responsavel}
                onChange={(e) => setFormTarefa({ ...formTarefa, responsavel: e.target.value })}
                placeholder="Nome do responsável"
              />

              <label>Prazo</label>
              <input
                type="date"
                value={formTarefa.prazo}
                onChange={(e) => setFormTarefa({ ...formTarefa, prazo: e.target.value })}
              />

              <label>Processo vinculado</label>
              <select
                value={formTarefa.processo_id}
                onChange={(e) => setFormTarefa({ ...formTarefa, processo_id: e.target.value })}
              >
                <option value="">Nenhum processo vinculado</option>
                {processos.map(processo => (
                  <option key={processo.id} value={processo.id}>
                    {processo.numero} — {processo.titulo}
                  </option>
                ))}
              </select>

              <label>Prioridade</label>
              <select
                value={formTarefa.prioridade}
                onChange={(e) => setFormTarefa({ ...formTarefa, prioridade: e.target.value })}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>

              <label>Situação</label>
              <select
                value={formTarefa.situacao}
                onChange={(e) => setFormTarefa({ ...formTarefa, situacao: e.target.value })}
              >
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluída">Concluída</option>
              </select>

              <div className="modal-acoes">
                <button type="button" className="botao-secundario" onClick={() => setModalTarefa(false)}>
                  Cancelar
                </button>
                <button type="submit" className="botao-principal">
                  {tarefaEditando ? "Salvar alterações" : "Cadastrar tarefa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
