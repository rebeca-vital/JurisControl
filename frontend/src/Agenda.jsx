
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardList,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function dataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function obterData(valor) {
  if (!valor) return null;
  const partes = String(valor).slice(0, 10).split("-");
  if (partes.length !== 3) return null;

  const [ano, mes, dia] = partes.map(Number);
  return new Date(ano, mes - 1, dia);
}

function Agenda({ tarefas, formatarData, classeSituacao, aoEditar }) {
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [diaSelecionado, setDiaSelecionado] = useState(dataLocal(hoje));

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const nomeMes = mesAtual.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
  });

  const primeiroDia = new Date(ano, mes, 1);
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

  const deslocamento = (primeiroDia.getDay() + 6) % 7;

  const dias = useMemo(() => {
    return [
      ...Array(deslocamento).fill(null),
      ...Array.from({ length: quantidadeDias }, (_, i) => i + 1)
    ];
  }, [deslocamento, quantidadeDias]);

  const tarefasComPrazo = tarefas.filter(tarefa => tarefa.prazo);

  function tarefasDoDia(data) {
    return tarefasComPrazo.filter(
      tarefa => String(tarefa.prazo).slice(0, 10) === data
    );
  }

  const tarefasSelecionadas = tarefasDoDia(diaSelecionado);

  function mudarMes(direcao) {
    const novoMes = new Date(ano, mes + direcao, 1);
    setMesAtual(novoMes);
    setDiaSelecionado(dataLocal(novoMes));
  }

  function irParaHoje() {
    setMesAtual(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setDiaSelecionado(dataLocal(hoje));
  }

  const totalMes = tarefasComPrazo.filter(tarefa => {
    const data = obterData(tarefa.prazo);
    return data && data.getFullYear() === ano && data.getMonth() === mes;
  }).length;

  const pendentes = tarefasComPrazo.filter(
    tarefa => tarefa.situacao === "Pendente"
  ).length;

  const concluidas = tarefasComPrazo.filter(
    tarefa => tarefa.situacao === "Concluída"
  ).length;

  const estilos = {
    calendario: {
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      gap: "8px"
    },
    diaSemana: {
      textAlign: "center",
      padding: "12px 2px",
      color: "#778399",
      fontSize: "12px",
      fontWeight: 700
    },
    dia: {
      minHeight: "85px",
      border: "1px solid #e7ebf1",
      borderRadius: "10px",
      background: "#fff",
      padding: "9px",
      cursor: "pointer",
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",
      color: "#26364a"
    }
  };

  return (
    <>
      <div className="grade-indicadores">
        <div className="indicador">
          <div className="indicador-topo">
            <span>Tarefas com prazo</span>
            <div className="indicador-icone azul">
              <ClipboardList size={20} />
            </div>
          </div>
          <strong>{tarefasComPrazo.length}</strong>
          <small>Atividades agendadas</small>
        </div>

        <div className="indicador">
          <div className="indicador-topo">
            <span>Pendentes</span>
            <div className="indicador-icone amarelo">
              <Clock3 size={20} />
            </div>
          </div>
          <strong>{pendentes}</strong>
          <small>Aguardando conclusão</small>
        </div>

        <div className="indicador">
          <div className="indicador-topo">
            <span>Concluídas</span>
            <div className="indicador-icone verde">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <strong>{concluidas}</strong>
          <small>Finalizadas</small>
        </div>

        <div className="indicador">
          <div className="indicador-topo">
            <span>Este mês</span>
            <div className="indicador-icone laranja">
              <CalendarDays size={20} />
            </div>
          </div>
          <strong>{totalMes}</strong>
          <small>Tarefas com prazo no mês</small>
        </div>
      </div>

      <div className="cartao" style={{ marginTop: "22px" }}>
        <div
          className="cartao-cabecalho"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px"
          }}
        >
          <div>
            <h3 style={{ textTransform: "capitalize" }}>{nomeMes}</h3>
            <p>Consulte as tarefas e seus respectivos prazos.</p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="botao-secundario" onClick={irParaHoje}>
              Hoje
            </button>

            <button
              className="botao-secundario"
              onClick={() => mudarMes(-1)}
              title="Mês anterior"
              aria-label="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              className="botao-secundario"
              onClick={() => mudarMes(1)}
              title="Próximo mês"
              aria-label="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <div style={estilos.calendario}>
            {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map(dia => (
              <div key={dia} style={estilos.diaSemana}>
                {dia}
              </div>
            ))}

            {dias.map((dia, indice) => {
              if (!dia) {
                return <div key={`vazio-${indice}`} />;
              }

              const data = dataLocal(new Date(ano, mes, dia));
              const atividades = tarefasDoDia(data);
              const selecionado = diaSelecionado === data;
              const ehHoje = data === dataLocal(hoje);

              return (
                <button
                  key={data}
                  type="button"
                  onClick={() => setDiaSelecionado(data)}
                  style={{
                    ...estilos.dia,
                    border: selecionado
                      ? "2px solid #0A2E6E"
                      : "1px solid #e7ebf1",
                    background: selecionado ? "#f0f5ff" : "#fff"
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: ehHoje ? "#0A2E6E" : "#26364a",
                      background: ehHoje ? "#e3ecff" : "transparent",
                      borderRadius: "50%",
                      width: "27px",
                      height: "27px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {dia}
                  </span>

                  {atividades.length > 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#0A2E6E",
                        fontWeight: 700
                      }}
                    >
                      {atividades.length} tarefa(s)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cartao" style={{ marginTop: "22px" }}>
        <div className="cartao-cabecalho">
          <div>
            <h3>
              Tarefas de {obterData(diaSelecionado)?.toLocaleDateString(
                "pt-BR",
                { day: "2-digit", month: "long" }
              )}
            </h3>
            <p>Atividades cadastradas para a data selecionada.</p>
          </div>
          <CalendarDays size={22} />
        </div>

        {tarefasSelecionadas.length === 0 ? (
          <div className="estado-vazio">
            <CalendarDays size={30} />
            <strong>Nenhuma tarefa nesta data</strong>
            <span>Selecione outro dia ou cadastre uma tarefa com este prazo.</span>
          </div>
        ) : (
          <div className="lista-atividades">
            {tarefasSelecionadas.map(tarefa => (
              <div className="atividade" key={tarefa.id}>
                <div className="atividade-icone">
                  {tarefa.situacao === "Concluída"
                    ? <CheckCircle2 size={17} />
                    : <AlertCircle size={17} />}
                </div>

                <div className="atividade-info">
                  <strong>{tarefa.titulo}</strong>
                  <span>
                    {tarefa.responsavel || "Sem responsável"}
                    {" · "}
                    {tarefa.processo_numero || "Sem processo vinculado"}
                    {" · "}
                    Prazo: {formatarData(tarefa.prazo)}
                  </span>
                  <span style={{ fontSize: "12px", marginTop: "4px" }}>
                    Prioridade: {tarefa.prioridade}
                  </span>
                </div>

                <span className={`etiqueta ${classeSituacao(tarefa.situacao)}`}>
                  {tarefa.situacao}
                </span>

                {aoEditar && (
                  <button
                    className="acao-editar"
                    title="Editar tarefa"
                    onClick={() => aoEditar(tarefa)}
                  >
                    Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Agenda;
