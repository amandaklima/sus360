import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.pagina}>

            <div className={styles.container}>

                {/* Logo */}
                <div className={styles.logoContainer}>
                    <img
                        src={logo}
                        className={styles.logo}
                        alt="SUS360"
                    />
                </div>

                {/* Título */}
                <div className={styles.boasVindas}>
                    <p>Encontre o que precisa</p>
                </div>

                {/* Menu */}
                <main className={styles.menu}>

                    <button
                        className={styles.botao}
                        onClick={() => navigate("/lista-unidades")}
                    >
                        <span className={styles.icone}>
                            +
                        </span>

                        <span className={styles.texto}>
                            Encontrar Serviço
                        </span>

                        <span className={styles.seta}>
                            ›
                        </span>
                    </button>


                    <button
                        className={styles.botao}
                        onClick={() => navigate("/lista-unidades")}
                    >
                        <span className={styles.icone}>
                            ♡
                        </span>

                        <span className={styles.texto}>
                            Hospitais
                        </span>

                        <span className={styles.seta}>
                            ›
                        </span>
                    </button>


                    <button
                        className={styles.botao}
                        onClick={() => navigate("/lista-unidades")}
                    >
                        <span className={styles.icone}>
                            +
                        </span>

                        <span className={styles.texto}>
                            UPA's
                        </span>

                        <span className={styles.seta}>
                            ›
                        </span>
                    </button>


                    <button
                        className={styles.botao}
                        onClick={() => navigate("/lista-unidades")}
                    >
                        <span className={styles.icone}>
                            ✓
                        </span>

                        <span className={styles.texto}>
                            Postos de Vacinação
                        </span>

                        <span className={styles.seta}>
                            ›
                        </span>
                    </button>

                </main>

                <p className={styles.rodape}>
                    SUS360 • O SUS visto por quem usa.
                </p>

            </div>

        </div>
    );
};

export default Home;