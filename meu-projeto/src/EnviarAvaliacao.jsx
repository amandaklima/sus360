import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EnviarAvaliacao.module.css";

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
const IconCheck = () => <Icon size={34}><path d="M5 12l5 5L20 7" /></Icon>;

const Estrela = ({ tamanho = 34, cheia }) => (
    <svg
        viewBox="0 0 24 24"
        width={tamanho}
        height={tamanho}
        className={cheia ? styles.estrelaCheia : styles.estrelaVazia}
        aria-hidden="true"
    >
        <path
            fill="currentColor"
            d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z"
        />
    </svg>
);

/* ---------- Dados (troque pela sua API) ---------- */

const UNIDADES = [
    { id: 1, nome: "UBS – Torrões" },
    { id: 2, nome: "UPA – Torrões" },
    { id: 3, nome: "Hospital da Restauração" },
    { id: 4, nome: "Posto de Vacinação – Boa Viagem" },
];

const ROTULOS = { 5: "Excelente", 4: "Muito bom", 3: "Bom", 2: "Regular", 1: "Ruim" };
const MAX_COMENTARIO = 500;

const hoje = () => new Date().toISOString().split("T")[0];

/* ---------- Tela ---------- */

const EnviarAvaliacao  = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // opcional: pré-seleciona a unidade

    const [form, setForm] = useState({
        nome: "",
        data: "",
        unidadeId: id && UNIDADES.some((u) => String(u.id) === id) ? id : "",
        nota: 0,
        comentario: "",
    });
    const [erros, setErros] = useState({});
    const [enviado, setEnviado] = useState(false);

    const atualizar = (campo, valor) => {
        setForm((f) => ({ ...f, [campo]: valor }));
        setErros((e) => ({ ...e, [campo]: undefined }));
    };

    const validar = () => {
        const e = {};
        if (!form.nome.trim()) e.nome = "Informe seu nome.";
        if (!form.data) e.data = "Informe a data do atendimento.";
        else if (form.data > hoje()) e.data = "A data não pode ser no futuro.";
        if (!form.unidadeId) e.unidadeId = "Escolha a unidade.";
        if (!form.nota) e.nota = "Escolha uma nota de 1 a 5 estrelas.";
        if (!form.comentario.trim()) e.comentario = "Escreva um comentário.";
        return e;
    };

    const enviar = (ev) => {
        ev.preventDefault();

        const e = validar();
        setErros(e);
        if (Object.keys(e).length > 0) return;

        // Troque pelo envio à sua API:
        // fetch("/api/avaliacoes", { method: "POST", body: JSON.stringify(form) })
        console.log("Avaliação enviada:", form);

        setEnviado(true);
    };

    /* ----- Confirmação ----- */
    if (enviado) {
        return (
            <div className={styles.pagina}>
                <header className={styles.topo}>
                    <div className={styles.topoConteudo}>
                        <h1 className={styles.titulo}>Avaliação enviada</h1>
                    </div>
                </header>

                <main className={styles.conteudo}>
                    <section className={`${styles.card} ${styles.sucesso}`}>
                        <span className={styles.sucessoIcone}><IconCheck /></span>
                        <h2 className={styles.sucessoTitulo}>Obrigado pela sua avaliação!</h2>
                        <p className={styles.sucessoTexto}>
                            Seu comentário ajuda outras pessoas a escolherem onde ser atendidas.
                        </p>
                    </section>

                    <button
                        type="button"
                        className={styles.enviar}
                        onClick={() => navigate(`/lista-avaliacoes/${form.unidadeId}`)}
                    >
                        Ver avaliações da unidade
                    </button>
                </main>
            </div>
        );
    }

    /* ----- Formulário ----- */
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

                    <h1 className={styles.titulo}>Enviar avaliação</h1>
                </div>
            </header>

            <main className={styles.conteudo}>
                <form className={styles.form} onSubmit={enviar} noValidate>
                    <section className={styles.card}>
                        {/* Nome */}
                        <div className={styles.campo}>
                            <label htmlFor="nome" className={styles.label}>Nome</label>
                            <input
                                id="nome"
                                type="text"
                                className={`${styles.input} ${erros.nome ? styles.inputErro : ""}`}
                                value={form.nome}
                                onChange={(e) => atualizar("nome", e.target.value)}
                                placeholder="Como você quer ser identificado(a)"
                                autoComplete="name"
                                aria-invalid={!!erros.nome}
                                aria-describedby={erros.nome ? "erro-nome" : undefined}
                            />
                            {erros.nome && <span id="erro-nome" className={styles.erro}>{erros.nome}</span>}
                        </div>

                        {/* Data do atendimento */}
                        <div className={styles.campo}>
                            <label htmlFor="data" className={styles.label}>Data do atendimento</label>
                            <input
                                id="data"
                                type="date"
                                max={hoje()}
                                className={`${styles.input} ${erros.data ? styles.inputErro : ""}`}
                                value={form.data}
                                onChange={(e) => atualizar("data", e.target.value)}
                                aria-invalid={!!erros.data}
                                aria-describedby={erros.data ? "erro-data" : undefined}
                            />
                            {erros.data && <span id="erro-data" className={styles.erro}>{erros.data}</span>}
                        </div>

                        {/* Unidade */}
                        <div className={styles.campo}>
                            <label htmlFor="unidade" className={styles.label}>Unidade</label>
                            <select
                                id="unidade"
                                className={`${styles.input} ${erros.unidadeId ? styles.inputErro : ""}`}
                                value={form.unidadeId}
                                onChange={(e) => atualizar("unidadeId", e.target.value)}
                                aria-invalid={!!erros.unidadeId}
                                aria-describedby={erros.unidadeId ? "erro-unidade" : undefined}
                            >
                                <option value="">Selecione a unidade</option>
                                {UNIDADES.map((u) => (
                                    <option key={u.id} value={u.id}>{u.nome}</option>
                                ))}
                            </select>
                            {erros.unidadeId && <span id="erro-unidade" className={styles.erro}>{erros.unidadeId}</span>}
                        </div>
                    </section>

                    {/* Nota */}
                    <section className={styles.card}>
                        <h2 id="titulo-nota" className={styles.notaTitulo}>O que achou do serviço?</h2>

                        <div className={styles.notaLinha}>
                            <div
                                className={styles.estrelasInput}
                                role="radiogroup"
                                aria-labelledby="titulo-nota"
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        role="radio"
                                        aria-checked={form.nota === n}
                                        aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"} – ${ROTULOS[n]}`}
                                        className={styles.estrelaBtn}
                                        onClick={() => atualizar("nota", n)}
                                    >
                                        <Estrela cheia={n <= form.nota} />
                                    </button>
                                ))}
                            </div>

                            {form.nota > 0 && <span className={styles.rotulo}>{ROTULOS[form.nota]}</span>}
                        </div>

                        {erros.nota && <span className={styles.erro}>{erros.nota}</span>}
                    </section>

                    {/* Comentário */}
                    <section className={styles.card}>
                        <div className={styles.campo}>
                            <label htmlFor="comentario" className={styles.label}>Comentário</label>
                            <textarea
                                id="comentario"
                                rows={5}
                                maxLength={MAX_COMENTARIO}
                                className={`${styles.input} ${styles.textarea} ${erros.comentario ? styles.inputErro : ""}`}
                                value={form.comentario}
                                onChange={(e) => atualizar("comentario", e.target.value)}
                                placeholder="Conte como foi o atendimento, a equipe e o ambiente."
                                aria-invalid={!!erros.comentario}
                                aria-describedby={erros.comentario ? "erro-comentario" : undefined}
                            />
                            <div className={styles.rodapeCampo}>
                                {erros.comentario
                                    ? <span id="erro-comentario" className={styles.erro}>{erros.comentario}</span>
                                    : <span />}
                                <span className={styles.contador}>
                                    {form.comentario.length}/{MAX_COMENTARIO}
                                </span>
                            </div>
                        </div>
                    </section>

                    <button type="submit" className={styles.enviar}>Enviar avaliação</button>

                    <button
                        type="button"
                        className={styles.cancelar}
                        onClick={() => navigate(-1)}
                    >
                        Cancelar
                    </button>
                </form>
            </main>
        </div>
    );
};

export default EnviarAvaliacao ;