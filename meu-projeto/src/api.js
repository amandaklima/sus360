import { useEffect, useState } from "react";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class ApiError extends Error {
    constructor(status, corpo) {
        super(corpo?.mensagem ?? "Não foi possível falar com o servidor.");
        this.status = status;
        // { campo: mensagem } quando a API devolve erros de validação (400)
        this.campos = Object.fromEntries(
            (corpo?.campos ?? []).map((c) => [c.campo, c.mensagem])
        );
    }
}

/* ---------- Sessão (login) ---------- */

const CHAVE_SESSAO = "sus360.sessao";
export const EVENTO_SESSAO = "sus360:sessao";

/** { token, expiraEm, usuario: { id, nome, email } } ou null. Ignora sessão vencida. */
export function lerSessao() {
    try {
        const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO));
        if (!sessao?.token || !sessao?.usuario) return null;
        if (sessao.expiraEm && new Date(sessao.expiraEm) <= new Date()) {
            localStorage.removeItem(CHAVE_SESSAO);
            return null;
        }
        return sessao;
    } catch {
        return null;
    }
}

function gravarSessao(sessao) {
    try {
        if (sessao) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
        else localStorage.removeItem(CHAVE_SESSAO);
    } catch {
        // navegador sem localStorage (modo privado etc.): a sessão vale só nesta aba
    }
    window.dispatchEvent(new CustomEvent(EVENTO_SESSAO, { detail: sessao }));
}

/* ---------- Requisições ---------- */

async function requisitar(caminho, { params, signal, auth = false, ...opcoes } = {}) {
    const url = new URL(`${BASE_URL}${caminho}`);
    Object.entries(params ?? {}).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") {
            url.searchParams.set(chave, valor);
        }
    });

    const headers = { "Content-Type": "application/json" };
    // o token só vai nas chamadas que exigem login
    const token = auth ? lerSessao()?.token : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    let resposta;
    try {
        resposta = await fetch(url, { ...opcoes, signal, headers });
    } catch (e) {
        if (e.name === "AbortError") throw e;
        throw new ApiError(0, { mensagem: "Sem conexão com o servidor. Tente novamente." });
    }

    if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        // token vencido ou inválido: encerra a sessão local para a tela pedir login de novo
        if (auth && resposta.status === 401) gravarSessao(null);
        throw new ApiError(resposta.status, corpo);
    }
    return resposta.json();
}

/* ---------- Endpoints ---------- */

export const listarUnidades = ({ tipo, servico, busca } = {}, signal) =>
    requisitar("/api/unidades", { params: { tipo, servico, busca }, signal });

export const listarAvaliacoes = (unidadeId, { nota, page = 1, size = 4 } = {}, signal) =>
    requisitar(`/api/unidades/${unidadeId}/avaliacoes`, {
        params: { nota, page, size },
        signal,
    });

export const buscarAvaliacao = (id, signal) => requisitar(`/api/avaliacoes/${id}`, { signal });

// exige login: o autor é o usuário logado
export const criarAvaliacao = (dados) =>
    requisitar("/api/avaliacoes", { method: "POST", body: JSON.stringify(dados), auth: true });

/* ---------- Login ---------- */

export async function entrar({ email, senha }) {
    const sessao = await requisitar("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
    });
    gravarSessao(sessao);
    return sessao.usuario;
}

export async function cadastrar({ nome, email, senha }) {
    const sessao = await requisitar("/api/auth/cadastro", {
        method: "POST",
        body: JSON.stringify({ nome, email, senha }),
    });
    gravarSessao(sessao); // o cadastro já entra logado
    return sessao.usuario;
}

export const sair = () => gravarSessao(null);

/** Confere com a API se o token guardado ainda vale (devolve o usuário atualizado). */
export const buscarUsuarioLogado = () => requisitar("/api/auth/me", { auth: true });

/* ---------- Utilidades ---------- */

// "2025-08-12" → "12/08/2025" (sem passar por Date, para não sofrer com fuso)
export const formatarData = (iso) => {
    const [ano, mes, dia] = (iso ?? "").split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
};

/**
 * Carrega dados da API e refaz a chamada quando `deps` mudam.
 * Cancela a requisição anterior para evitar resposta fora de ordem.
 */
export function useApi(carregar, deps) {
    const [estado, setEstado] = useState({ dados: null, erro: null, carregando: true });

    useEffect(() => {
        const controle = new AbortController();
        setEstado((e) => ({ ...e, erro: null, carregando: true }));

        carregar(controle.signal)
            .then((dados) => setEstado({ dados, erro: null, carregando: false }))
            .catch((erro) => {
                if (erro.name === "AbortError") return;
                setEstado({ dados: null, erro, carregando: false });
            });

        return () => controle.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return estado;
}
