import styles from "./Home.css";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../../src/assets/logo.png";

export const InicioInspecoes = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.pagina}>

            <img
                src={logo}
                className={styles.logo}
                alt="Logo"
                onClick={() => navigate("/")}
            />

            <main className={styles.divContent}>

                <div className={styles.tituloPagina}>
                    <h1>SUS360</h1>
                    <span></span>
                </div>
                <button
                    className={styles.divFiltros}
                    onClick={() => navigate("/lista-unidades")}
                >
                    <Icon
                        icon="material-symbols:playlist-add"
                        className={styles.divIcone}
                    />

                    <div className={styles.divTitulo}>
                        <h2>Unidades</h2>
                        <p>
                            Busca por Unidade de Saúde
                        </p>
                    </div>

                    <Icon
                        icon="material-symbols:arrow-forward-ios"
                        className={styles.divSeta}
                    />

                </button>

                <button
                    className={styles.divFiltros}
                    onClick={() => navigate("/lista-unidades")}
                >

                    <Icon
                        icon="material-symbols:fact-check"
                        className={styles.divIcone}
                    />

                    <div className={styles.divTitulo}>
                        <h2>Serviço</h2>
                        <p>
                            Busca por Tipo de Atendimento
                        </p>
                    </div>

                    <Icon
                        icon="material-symbols:arrow-forward-ios"
                        className={styles.divSeta}
                    />

                </button>

            </main>
        </div>
    );
};

export default Home;
