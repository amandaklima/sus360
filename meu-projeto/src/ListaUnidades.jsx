import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./ListaUnidades.module.css";

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

const IconVoltar = () => <Icon size={22}><path d="M15 18l-6-6 6-6" /></Icon>;
const IconPin = () => <Icon><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></Icon>;
const IconRelogio = () => <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
const IconTelefone = () => <Icon><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Icon>;
const IconBusca = () => <Icon size={20}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Icon>;
const IconFiltro = () => <Icon size={20}><path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" /></Icon>;
const IconSeta = () => <Icon size={20}><path d="M9 18l6-6-6-6" /></Icon>;

const Estrelas = ({ nota }) => (
    <span className={styles.estrelas} aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
            <svg
                key={n}
                viewBox="0 0 24 24"
                width="15"
                height="15"
                className={n <= Math.round(nota) ? styles.estrelaCheia : styles.estrelaVazia}
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

const UNIDADES = [
    {
        id: 1,
        tipo: "UBS",
        nome: "UBS – Torrões",
        endereco: "Rua dos Torrões, 123 – Recife/PE",
        horario: "Segunda a Sexta · 7h às 17h",
        telefone: "(81) 4003-8920",
        nota: 4.7,
        avaliacoes: 109,
        servicos: ["Vacinas", "Exames", "Atendimentos", "Medicamentos"],
        foto: null,
    },
    {
        id: 2,
        tipo: "UPA",
        nome: "UPA – Torrões",
        endereco: "Av. Recife, 456 – Recife/PE",
        horario: "Todos os dias · 24h",
        telefone: "(81) 3184-0000",
        nota: 4.5,
        avaliacoes: 98,
        servicos: ["Exames", "Atendimentos"],
        foto: null,
    },
    {
        id: 3,
        tipo: "Hospital",
        nome: "Hospital da Restauração",
        endereco: "Av. Agamenon Magalhães, s/n – Recife/PE",
        horario: "Todos os dias · 24h",
        telefone: "(81) 3181-5400",
        nota: 4.2,
        avaliacoes: 312,
        servicos: ["Exames", "Atendimentos"],
        foto: null,
    },
    {
        id: 4,
        tipo: "Posto",
        nome: "Posto de Vacinação – Boa Viagem",
        endereco: "Rua dos Navegantes, 800 – Recife/PE",
        horario: "Segunda a Sábado · 8h às 16h",
        telefone: "(81) 3355-1000",
        nota: 4.8,
        avaliacoes: 54,
        servicos: ["Vacinas"],
        foto: null,
    },
];

const CATEGORIAS = ["Todos", "Vacinas", "Exames", "Atendimentos", "Medicamentos"];

// valor da URL (?tipo=) → tipo da unidade
const TIPO_POR_ROTA = {
    hospitais: "Hospital",
    upas: "UPA",
    vacinacao: "Posto",
};

const normalizar = (t) =>
    t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ---------- Tela ---------- */

const ListaUnidades = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [busca, setBusca] = useState("");
    const [categoria, setCategoria] = useState("Todos");

    const tipoFiltro = TIPO_POR_ROTA[params.get("tipo")];

    const unidades = useMemo(() => {
        const termo = normalizar(busca.trim());

        return UNIDADES.filter((u) => {
            if (tipoFiltro && u.tipo !== tipoFiltro) return false;
            if (categoria !== "Todos" && !u.servicos.includes(categoria)) return false;
            if (!termo) return true;

            return normalizar(`${u.nome} ${u.endereco} ${u.tipo}`).includes(termo);
        });
    }, [busca, categoria, tipoFiltro]);

    return (
        <div className={styles.pagina}>
            {/* Cabeçalho */}
            <header className={styles.topo}>
                <div className={styles.topoConteudo}>
                    <button
                        type="button"
                        className={styles.voltar}
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                    >
                        <IconVoltar />
                    </button>

                    <h1 className={styles.titulo}>Buscar Serviço</h1>

                </div>
            </header>

            <main className={styles.conteudo}>
                {/* Busca */}
                <div className={styles.buscaLinha}>
                    <label className={styles.busca}>
                        <IconBusca />
                        <input
                            type="search"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Digite o nome do serviço, unidade ou bairro..."
                            aria-label="Buscar unidade"
                        />
                    </label>

                    <button type="button" className={styles.filtroBtn} aria-label="Filtros">
                        <IconFiltro />
                    </button>
                </div>

                {/* Categorias */}
                <div className={styles.chips} role="tablist" aria-label="Categorias">
                    {CATEGORIAS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            role="tab"
                            aria-selected={categoria === c}
                            className={`${styles.chip} ${categoria === c ? styles.chipAtivo : ""}`}
                            onClick={() => setCategoria(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* Lista */}
                {unidades.length === 0 ? (
                    <p className={styles.vazio}>
                        Nenhuma unidade encontrada. Tente outro nome ou categoria.
                    </p>
                ) : (
                    <ul className={styles.lista}>
                        {unidades.map((u) => (
                            <li key={u.id} className={styles.card}>
                                <div className={styles.cardTopo}>
                                    <div className={styles.foto}>
                                        {u.foto ? (
                                            <img src={u.foto} alt={u.nome} loading="lazy" />
                                        ) : (
                                            <span className={styles.fotoVazia}>{u.tipo}</span>
                                        )}
                                    </div>

                                    <div className={styles.info}>
                                        <span className={styles.tag}>{u.tipo}</span>
                                        <h2 className={styles.nome}>{u.nome}</h2>

                                        <p className={styles.linha}><IconPin />{u.endereco}</p>
                                        <p className={styles.linha}><IconRelogio />{u.horario}</p>
                                        <p className={styles.linha}><IconTelefone />{u.telefone}</p>

                                        <p className={styles.avaliacao}>
                                            <Estrelas nota={u.nota} />
                                            <span>
                                                {u.nota.toFixed(1).replace(".", ",")} ({u.avaliacoes} avaliações)
                                            </span>
                                        </p>
                                    </div>

                                    <span className={styles.seta}><IconSeta /></span>
                                </div>

                                <button
                                    type="button"
                                    className={styles.detalhes}
                                    onClick={() => navigate(`/lista-avaliacoes/${u.id}`)}
                                >
                                    Ver Avaliações
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
};

export default ListaUnidades;