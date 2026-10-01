import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

const Svg = ({ children }) => (
    <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
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

const itens = [
    {
        titulo: "Encontrar Serviço",
        descricao: "Unidades, serviços e farmácias",
        tipo: "servicos",
        icone: (
            <Svg>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
            </Svg>
        ),
    },
    {
        titulo: "Hospitais",
        descricao: "Unidades hospitalares",
        tipo: "hospitais",
        icone: (
            <Svg>
                <path d="M4 21V7l8-4 8 4v14M2 21h20M12 9v6M9 12h6" />
            </Svg>
        ),
    },
    {
        titulo: "UPAs",
        descricao: "Atendimento de urgência",
        tipo: "upas",
        icone: (
            <Svg>
                <path d="M3 12h4l2-5 4 10 2-5h6" />
            </Svg>
        ),
    },
    {
        titulo: "Postos de Vacinação",
        descricao: "Campanhas e unidades",
        tipo: "vacinacao",
        icone: (
            <Svg>
                <path d="M18 2l4 4M17 7l3-3M19 9l-8.7 8.7a2 2 0 0 1-2.8 0L6.3 16.5a2 2 0 0 1 0-2.8L15 5M9 11l4 4M5 19l-3 3M14 4l6 6" />
            </Svg>
        ),
    },
];

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.pagina}>
            <div className={styles.container}>
                {/* Logo + texto */}
                <header className={styles.topo}>
                    <div className={styles.logoContainer}>
                        <img src={logo} className={styles.logo} alt="SUS360" />
                    </div>
{/* 
                    <div className={styles.boasVindas}>
                        <h1>Encontre o que precisa</h1>
                        <p>Sua saúde em um só lugar</p>
                    </div> */}
                </header>

                {/* Menu */}
                <main className={styles.menu}>
                    {itens.map((item) => (
                        <button
                            key={item.tipo}
                            type="button"
                            className={styles.botao}
                            onClick={() => navigate(`/lista-unidades?tipo=${item.tipo}`)}
                        >
                            <span className={styles.icone}>{item.icone}</span>

                            <span className={styles.texto}>
                                <strong>{item.titulo}</strong>
                                <small>{item.descricao}</small>
                            </span>

                            <span className={styles.seta} aria-hidden="true">
                                ›
                            </span>
                        </button>
                    ))}
                </main>

                <p className={styles.rodape}>
                    SUS360 • O SUS visto por quem usa.
                </p>
            </div>
        </div>
    );
};

export default Home;