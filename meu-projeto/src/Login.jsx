import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./Login.module.css";
import { ApiError } from "./api";
import { destinoSeguro, useAuth } from "./auth";

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
const IconOlho = () => <Icon><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>;
const IconOlhoFechado = () => <Icon><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" /></Icon>;

/* ---------- Regras (iguais às da API) ---------- */

const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 8;
const SENHA_MAX = 72;

/* ---------- Tela ---------- */

/** Login (/login) e cadastro (/cadastro) na mesma tela. */
const Login = ({ modo = "login" }) => {
    const cadastro = modo === "cadastro";
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const { usuario, entrar, cadastrar } = useAuth();

    const voltar = destinoSeguro(params.get("voltar"));
    const sufixo = params.get("voltar") ? `?voltar=${encodeURIComponent(voltar)}` : "";
    const aviso = location.state?.aviso;

    const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
    const [verSenha, setVerSenha] = useState(false);
    const [erros, setErros] = useState({});
    const [enviando, setEnviando] = useState(false);

    // já logado: não faz sentido ver o formulário
    if (usuario && !enviando) return <Navigate to={voltar} replace />;

    const atualizar = (campo, valor) => {
        setForm((f) => ({ ...f, [campo]: valor }));
        setErros((e) => ({ ...e, [campo]: undefined, geral: undefined }));
    };

    const validar = () => {
        const e = {};
        const email = form.email.trim();
        if (cadastro && !form.nome.trim()) e.nome = "Informe seu nome.";
        if (!email) e.email = "Informe seu e-mail.";
        else if (!EMAIL_OK.test(email)) e.email = "Informe um e-mail válido.";
        if (!form.senha) e.senha = cadastro ? "Crie uma senha." : "Informe sua senha.";
        else if (cadastro && (form.senha.length < SENHA_MIN || form.senha.length > SENHA_MAX)) {
            e.senha = `A senha deve ter entre ${SENHA_MIN} e ${SENHA_MAX} caracteres.`;
        }
        if (cadastro && !e.senha && form.confirmar !== form.senha) {
            e.confirmar = "As senhas não são iguais.";
        }
        return e;
    };

    const enviar = async (ev) => {
        ev.preventDefault();
        const e = validar();
        setErros(e);
        if (Object.keys(e).length > 0) return;

        setEnviando(true);
        try {
            const dados = { email: form.email.trim(), senha: form.senha };
            if (cadastro) await cadastrar({ ...dados, nome: form.nome.trim() });
            else await entrar(dados);
            navigate(voltar, { replace: true });
        } catch (err) {
            const campos = err instanceof ApiError ? err.campos : {};
            setErros(
                Object.keys(campos).length > 0
                    ? campos
                    : { geral: err.message || "Não foi possível entrar. Tente novamente." }
            );
            // senha errada: limpa só a senha para digitar de novo
            if (err instanceof ApiError && err.status === 401) {
                setForm((f) => ({ ...f, senha: "" }));
            }
            setEnviando(false);
        }
    };

    const campoSenha = (id, campo, rotulo, autoComplete) => (
        <div className={styles.campo}>
            <label htmlFor={id} className={styles.label}>{rotulo}</label>
            <div className={styles.senhaLinha}>
                <input
                    id={id}
                    type={verSenha ? "text" : "password"}
                    className={`${styles.input} ${erros[campo] ? styles.inputErro : ""}`}
                    value={form[campo]}
                    onChange={(e) => atualizar(campo, e.target.value)}
                    autoComplete={autoComplete}
                    maxLength={SENHA_MAX}
                    aria-invalid={!!erros[campo]}
                    aria-describedby={erros[campo] ? `erro-${id}` : undefined}
                />
                {campo === "senha" && (
                    <button
                        type="button"
                        className={styles.olho}
                        onClick={() => setVerSenha((v) => !v)}
                        aria-label={verSenha ? "Esconder senha" : "Mostrar senha"}
                        aria-pressed={verSenha}
                    >
                        {verSenha ? <IconOlhoFechado /> : <IconOlho />}
                    </button>
                )}
            </div>
            {erros[campo] && <span id={`erro-${id}`} className={styles.erro}>{erros[campo]}</span>}
        </div>
    );

    return (
        <div className={styles.pagina}>
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
                    <h1 className={styles.titulo}>{cadastro ? "Criar conta" : "Entrar"}</h1>
                </div>
            </header>

            <main className={styles.conteudo}>
                {aviso && <p className={styles.aviso} role="status">{aviso}</p>}

                <form className={styles.form} onSubmit={enviar} noValidate>
                    <section className={styles.card}>
                        {cadastro && (
                            <div className={styles.campo}>
                                <label htmlFor="nome" className={styles.label}>Nome</label>
                                <input
                                    id="nome"
                                    type="text"
                                    className={`${styles.input} ${erros.nome ? styles.inputErro : ""}`}
                                    value={form.nome}
                                    onChange={(e) => atualizar("nome", e.target.value)}
                                    placeholder="Como você quer aparecer nas avaliações"
                                    autoComplete="name"
                                    maxLength={100}
                                    aria-invalid={!!erros.nome}
                                    aria-describedby={erros.nome ? "erro-nome" : undefined}
                                />
                                {erros.nome && <span id="erro-nome" className={styles.erro}>{erros.nome}</span>}
                            </div>
                        )}

                        <div className={styles.campo}>
                            <label htmlFor="email" className={styles.label}>E-mail</label>
                            <input
                                id="email"
                                type="email"
                                inputMode="email"
                                className={`${styles.input} ${erros.email ? styles.inputErro : ""}`}
                                value={form.email}
                                onChange={(e) => atualizar("email", e.target.value)}
                                placeholder="voce@exemplo.com"
                                autoComplete={cadastro ? "email" : "username"}
                                autoCapitalize="none"
                                spellCheck={false}
                                aria-invalid={!!erros.email}
                                aria-describedby={erros.email ? "erro-email" : undefined}
                            />
                            {erros.email && <span id="erro-email" className={styles.erro}>{erros.email}</span>}
                        </div>

                        {campoSenha("senha", "senha", "Senha", cadastro ? "new-password" : "current-password")}
                        {cadastro && campoSenha("confirmar", "confirmar", "Confirmar senha", "new-password")}
                        {cadastro && !erros.senha && (
                            <span className={styles.dica}>Mínimo de {SENHA_MIN} caracteres.</span>
                        )}
                    </section>

                    {erros.geral && <p className={styles.erroGeral} role="alert">{erros.geral}</p>}

                    <button type="submit" className={styles.enviar} disabled={enviando}>
                        {enviando
                            ? cadastro ? "Criando conta..." : "Entrando..."
                            : cadastro ? "Criar conta" : "Entrar"}
                    </button>

                    <p className={styles.alternar}>
                        {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
                        <Link to={`${cadastro ? "/login" : "/cadastro"}${sufixo}`} replace state={location.state}>
                            {cadastro ? "Entrar" : "Criar conta"}
                        </Link>
                    </p>
                </form>
            </main>
        </div>
    );
};

export default Login;
