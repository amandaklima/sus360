import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaAvaliacoes.module.css";

/* ---------- Ícones ---------- */

const Icon = ({ children, size = 20 }) => (
    <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const IconVoltar = () => <Icon size={22}><path d="M15 18l-6-6 6-6" /></Icon>;
const IconFiltro = () => <Icon><path d="M4 6h16M7 12h10M10 18h4" /></Icon>;
const IconLapis = () => <Icon><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></Icon>;
const IconAnterior = () => <Icon size={18}><path d="M15 18l-6-6 6-6" /></Icon>;
const IconProxima = () => <Icon size={18}><path d="M9 18l6-6-6-6" /></Icon>;

const Estrelas = ({ nota }) => (
    <span
        className={styles.estrelas}
        role="img"
        aria-label={`${nota} de 5 estrelas`}
    >
        {[1, 2, 3, 4, 5].map((n) => (
            <svg
                key={n}
                viewBox="0 0 24 24"
                width="15"
                height="15"
                className={n <= nota ? styles.estrelaCheia : styles.estrelaVazia}
            >
                <path
                    fill="currentColor"
                    d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z"
                />
            </svg>
        ))}
    </span>
);

/* ---------- Dados (troque pela sua API) ---------- */

const AVALIACOES = [
    { id: 1, autor: "Usuário Anônimo", nota: 5, data: "12/08/2025", texto: "Fui atendido(a) pelo Dr. Carlos na unidade. O atendimento foi excelente, equipe muito atenciosa e o ambiente bem organizado." },
    { id: 2, autor: "Usuário Anônimo", nota: 4, data: "30/04/2025", texto: "A unidade é boa, mas esperei muito cheia. Tive que aguardar um pouco, mas fui bem atendido(a) no final." },
    { id: 3, autor: "Usuário Anônimo", nota: 5, data: "15/04/2025", texto: "Ótimo atendimento! A equipe é muito educada e o local é limpo. Recomendo!" },
    { id: 4, autor: "Usuário Anônimo", nota: 3, data: "02/04/2025", texto: "Gostei do atendimento, mas o sistema estava um pouco lento. Fora isso, tudo correu bem." },
    { id: 5, autor: "Usuário Anônimo", nota: 5, data: "28/03/2025", texto: "Vacinação rápida e sem fila. Profissionais muito simpáticos." },
    { id: 6, autor: "Usuário Anônimo", nota: 2, data: "20/03/2025", texto: "Demorou mais de duas horas para ser chamado. Faltou informação sobre o tempo de espera." },
    { id: 7, autor: "Usuário Anônimo", nota: 4, data: "11/03/2025", texto: "Boa estrutura e farmácia com os medicamentos que eu precisava." },
    { id: 8, autor: "Usuário Anônimo", nota: 5, data: "02/03/2025", texto: "Exames agendados e entregues no prazo. Atendimento nota 10." },
];

const POR_PAGINA = 4;
const FILTROS = ["Todas", 5, 4, 3, 2, 1];

/* ---------- Tela ---------- */

const ListaAvaliacoes = () => {
    const navigate = useNavigate();

    const [filtro, setFiltro] = useState("Todas");
    const [filtroAberto, setFiltroAberto] = useState(false);
    const [pagina, setPagina] = useState(1);

    const filtradas = useMemo(
        () =>
            filtro === "Todas"
                ? AVALIACOES
                : AVALIACOES.filter((a) => a.nota === filtro),
        [filtro]
    );

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
    const inicio = (pagina - 1) * POR_PAGINA;
    const visiveis = filtradas.slice(inicio, inicio + POR_PAGINA);

    const escolherFiltro = (valor) => {
        setFiltro(valor);
        setPagina(1);
    };

    return (
        <div className={styles.pagina}>
            {/* Cabeçalho */}
            <header className={styles.topo}>
                <div className={styles.topoConteudo}>
                    <button
                        type="button"
                        className={styles.iconeBtn}
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                    >
                        <IconVoltar />
                    </button>

                    <h1 className={styles.titulo}>Avaliações</h1>

                    <button
                        type="button"
                        className={styles.iconeBtn}
                        onClick={() => setFiltroAberto((v) => !v)}
                        aria-label="Filtrar por nota"
                        aria-expanded={filtroAberto}
                    >
                        <IconFiltro />
                    </button>
                </div>
            </header>

            <main className={styles.conteudo}>
                {/* Filtro por nota */}
                {filtroAberto && (
                    <div className={styles.filtros} role="group" aria-label="Filtrar por nota">
                        {FILTROS.map((f) => (
                            <button
                                key={f}
                                type="button"
                                aria-pressed={filtro === f}
                                className={`${styles.chip} ${filtro === f ? styles.chipAtivo : ""}`}
                                onClick={() => escolherFiltro(f)}
                            >
                                {f === "Todas" ? "Todas" : `${f} ★`}
                            </button>
                        ))}
                    </div>
                )}

                {/* Lista */}
                {visiveis.length === 0 ? (
                    <p className={styles.vazio}>Nenhuma avaliação com essa nota ainda.</p>
                ) : (
                    <ul className={styles.lista}>
                        {visiveis.map((a) => (
                            <li key={a.id} className={styles.card}>
                                <div className={styles.cardTopo}>
                                    <strong className={styles.autor}>{a.autor}</strong>
                                    <Estrelas nota={a.nota} />
                                    <time className={styles.data}>{a.data}</time>
                                </div>

                                <p className={styles.texto}>{a.texto}</p>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Enviar avaliação */}
                <button
                    type="button"
                    className={styles.enviar}
                    onClick={() => navigate("/enviar-avaliacao")}
                >
                    <IconLapis />
                    Enviar Avaliação
                </button>

                {/* Paginação */}
                <nav className={styles.paginacao} aria-label="Paginação">
                    <button
                        type="button"
                        className={styles.pagBtn}
                        onClick={() => setPagina((p) => p - 1)}
                        disabled={pagina === 1}
                        aria-label="Página anterior"
                    >
                        <IconAnterior />
                    </button>

                    <span className={styles.pagTexto}>
                        {pagina} de {totalPaginas}
                    </span>

                    <button
                        type="button"
                        className={styles.pagBtn}
                        onClick={() => setPagina((p) => p + 1)}
                        disabled={pagina === totalPaginas}
                        aria-label="Próxima página"
                    >
                        <IconProxima />
                    </button>
                </nav>
            </main>
        </div>
    );
};

export default ListaAvaliacoes;