/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
    buscarUsuarioLogado,
    cadastrar,
    entrar,
    EVENTO_SESSAO,
    lerSessao,
    sair,
} from "./api";

const AuthContext = createContext(null);

/** Guarda quem está logado e mantém todas as telas em sincronia (inclusive outras abas). */
export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => lerSessao()?.usuario ?? null);

    useEffect(() => {
        const atualizar = () => setUsuario(lerSessao()?.usuario ?? null);
        window.addEventListener(EVENTO_SESSAO, atualizar);
        window.addEventListener("storage", atualizar); // login/logout em outra aba
        return () => {
            window.removeEventListener(EVENTO_SESSAO, atualizar);
            window.removeEventListener("storage", atualizar);
        };
    }, []);

    // ao abrir o site, confere com a API se o token guardado ainda vale
    useEffect(() => {
        if (!lerSessao()) return;
        buscarUsuarioLogado()
            .then((u) => setUsuario(u))
            .catch(() => {
                // 401 já encerra a sessão em api.js; sem conexão, mantém o login local
            });
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, entrar, cadastrar, sair }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
    return ctx;
}

/** Envolve uma tela que exige login: sem login, manda para /login e volta depois. */
export function RequireAuth({ children, aviso = "Entre na sua conta para continuar." }) {
    const { usuario } = useAuth();
    const location = useLocation();

    if (!usuario) {
        const voltar = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?voltar=${voltar}`} replace state={{ aviso }} />;
    }
    return children;
}

/** Só aceita caminhos internos ("/algo"), para o ?voltar= não virar redirecionamento para outro site. */
export function destinoSeguro(voltar) {
    return voltar && voltar.startsWith("/") && !voltar.startsWith("//") && !voltar.startsWith("/\\")
        ? voltar
        : "/";
}
