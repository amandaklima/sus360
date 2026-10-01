import { useNavigate, useParams } from "react-router-dom";
import styles from "./RegistrarAvaliacao.module.css";

/* ---------- Ícones ---------- */

const Icon = ({ children, size = 18 }) => (
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

const IconVoltar = ({ size = 22 }) => <Icon size={size}><path d="M15 18l-6-6 6-6" /></Icon>;
const IconPin = () => <Icon><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></Icon>;
const IconRelogio = () => <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const IconTelefone = () => <Icon><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Icon>;
const IconPredio = () => <Icon size={28}><path d="M4 21V7l8-4 8 4v14M2 21h20M12 9v6M9 12h6" /></Icon>;
const IconUsuario = () => <Icon size={30}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>;

const Estrelas = ({ nota, tamanho = 16 }) => (
    <span className={styles.estrelas} role="img" aria-label={`${nota} de 5 estrelas`}>
        {[1, 2, 3, 4, 5].map((n) => (
            <svg
                key={n}
                viewBox="0 0 24 24"
                width={tamanho}
                height={tamanho}
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

/* ---------- Dados (troque pela sua API, usando o id da rota) ---------- */

const ROTULOS = { 5: "Excelente", 4: "Muito bom", 3: "Bom", 2: "Regular", 1: "Ruim" };

const AVALIACAO = {
    autor: "Usuário Anônimo",
    data: "12/08/2025",
    nota: 5,
    texto:
        "Fui atendido(a) pelo Dr. Carlos na unidade. O atendimento foi excelente, equipe muito atenciosa e o ambiente bem organizado.",
    unidade: {
        nome: "UBS – Torrões",
        endereco: "Rua dos Torrões, 123 – Recife/PE",
        horario: "Segunda a Sexta · 7h às 17h",
        telefone: "(81) 4003-8920",
    },
};

/* ---------- Tela ---------- */

const Avaliacao = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // use para buscar a avaliação na API
    const a = AVALIACAO;

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

                    <h1 className={styles.titulo}>Avaliação</h1>
                </div>
            </header>

            <main className={styles.conteudo}>
                {/* Avaliação */}
                <section className={styles.card}>
                    <div className={styles.autorLinha}>
                        <span className={styles.avatar}><IconUsuario /></span>

                        <div className={styles.autorInfo}>
                            <strong className={styles.autor}>{a.autor}</strong>
                            <Estrelas nota={a.nota} />
                        </div>

                        <time className={styles.data}>{a.data}</time>
                    </div>

                    <p className={styles.texto}>{a.texto}</p>
                </section>

                <div className={styles.lateral}>
                    {/* Unidade avaliada */}
                    <section className={`${styles.card} ${styles.unidade}`}>
                        <span className={styles.predio}><IconPredio /></span>

                        <div className={styles.unidadeInfo}>
                            <h2 className={styles.unidadeNome}>{a.unidade.nome}</h2>
                            <p className={styles.linha}><IconPin />{a.unidade.endereco}</p>
                            <p className={styles.linha}><IconRelogio />{a.unidade.horario}</p>
                            <p className={styles.linha}><IconTelefone />{a.unidade.telefone}</p>
                        </div>
                    </section>

                    {/* Nota do serviço */}
                    <section className={`${styles.card} ${styles.nota}`}>
                        <h2 className={styles.notaTitulo}>O que achou do serviço?</h2>

                        <div className={styles.notaLinha}>
                            <Estrelas nota={a.nota} tamanho={30} />
                            <span className={styles.rotulo}>{ROTULOS[a.nota]}</span>
                        </div>
                    </section>
                </div>

                <button
                    type="button"
                    className={styles.voltar}
                    onClick={() => navigate(-1)}
                >
                    <IconVoltar size={18} />
                    Voltar
                </button>
            </main>
        </div>
    );
};

export default RegistrarAvaliacao;