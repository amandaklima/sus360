import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import logo from "./assets/logo.png";
import { useAuth } from "./auth";

const itens = [
    {
        titulo: "Encontrar serviço",
        descricao: "Vacinas, exames e consultas",
        tipo: "servicos",
        foto: "/unidades/servicos.svg",
    },
    {
        titulo: "Hospitais",
        descricao: "Atendimento hospitalar",
        tipo: "hospitais",
        foto: "/unidades/hospital.svg",
    },
    {
        titulo: "UPAs",
        descricao: "Urgência 24 horas",
        tipo: "upas",
        foto: "/unidades/upa.svg",
    },
    {
        titulo: "Postos e vacinação",
        descricao: "Unidades básicas e campanhas",
        tipo: "vacinacao",
        foto: "/unidades/posto.svg",
    },
];

const IconBusca = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
    </svg>
);

const Home = () => {
    const navigate = useNavigate();
    const { usuario, sair } = useAuth();
    const [busca, setBusca] = useState("");

    const buscar = (ev) => {
        ev.preventDefault();
        const texto = busca.trim();
        navigate(texto ? `/lista-unidades?busca=${encodeURIComponent(texto)}` : "/lista-unidades");
    };

    return (
        <div className={styles.pagina}>
            <nav className={styles.conta} aria-label="Conta">
                {usuario ? (
                    <>
                        <span className={styles.ola}>
                            Olá, <strong>{usuario.nome.split(" ")[0]}</strong>
                        </span>
                        <button type="button" className={styles.contaBtn} onClick={sair}>
                            Sair
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={styles.contaBtn}>Entrar</Link>
                        <Link to="/cadastro" className={`${styles.contaBtn} ${styles.contaBtnCheio}`}>
                            Criar conta
                        </Link>
                    </>
                )}
            </nav>

            <div className={styles.conteudo}>
                <header className={styles.hero}>
                    <img src={logo} className={styles.logo} alt="SUS360 – O SUS visto por quem usa" />

                    <h1 className={styles.titulo}>Qual atendimento você procura?</h1>

                    <form className={styles.busca} onSubmit={buscar} role="search">
                        <label className={styles.campo}>
                            <IconBusca />
                            <input
                                type="search"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Unidade, serviço ou bairro"
                                aria-label="Buscar unidade, serviço ou bairro"
                            />
                        </label>
                        <button type="submit" className={styles.buscarBtn}>Buscar</button>
                    </form>
                </header>

                <main className={styles.menu}>
                    {itens.map((item) => (
                        <Link
                            key={item.tipo}
                            to={`/lista-unidades?tipo=${item.tipo}`}
                            className={styles.card}
                        >
                            <span className={styles.foto}>
                                <img src={item.foto} alt="" loading="lazy" />
                            </span>
                            <span className={styles.texto}>
                                <strong>{item.titulo}</strong>
                                <small>{item.descricao}</small>
                            </span>
                        </Link>
                    ))}
                </main>
            </div>
        </div>
    );
};

export default Home;
