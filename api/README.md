# SUS360 — API

API REST do SUS360 em **Java 21 + Spring Boot 3.5**, com acesso ao banco por **JDBC** (`NamedParameterJdbcTemplate`) e tabelas criadas pelo **Flyway** na primeira subida. O banco é o **PostgreSQL do Supabase**.

A API **não usa** as chaves do Supabase (publishable/secret): ela conecta direto no Postgres.

## Como executar

Pré-requisito: Java 21 (o Maven vem junto, via `mvnw`).

1. Copie `.env.example` para `.env` e preencha `DB_PASSWORD` e `JWT_SECRET`.
2. Na pasta `api`:

```bash
./mvnw spring-boot:run
```

No Windows (PowerShell/CMD) use `mvnw.cmd spring-boot:run`. Ou gere o jar e rode:

```bash
./mvnw package
java -jar target/sus360-api.jar
```

A API sobe em `http://localhost:8080`. Saúde: `GET /actuator/health`.

Depois, na pasta `meu-projeto`, rode o front com `npm install` e `npm run dev` (o front usa `VITE_API_URL`, padrão `http://localhost:8080`).

## Conexão com o Supabase

Use o **Session pooler** (painel do Supabase → *Connect* → *Session pooler*):

```
DB_URL=jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
DB_USER=postgres.wryunefmcekdlttiddzr
```

O host direto `db.wryunefmcekdlttiddzr.supabase.co` só responde em **IPv6**, que não funciona na maioria das redes domésticas/universitárias nem em hospedagens como Render. Note que no pooler o usuário é `postgres.<id-do-projeto>`.

As tabelas ficam no schema **`sus360`** (não no `public`), para não ficarem expostas pela Data API do Supabase a quem tiver a chave publishable.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_URL` | pooler acima | URL JDBC do Postgres |
| `DB_USER` | `postgres.wryunefmcekdlttiddzr` | usuário |
| `DB_PASSWORD` | — (obrigatória) | senha do banco |
| `DB_SCHEMA` | `sus360` | schema das tabelas |
| `DB_POOL_SIZE` | `5` | conexões no pool |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173,…` | origens do front, separadas por vírgula; aceita curinga (`https://*.vercel.app`) |
| `JWT_SECRET` | — (obrigatória) | chave que assina os tokens de login, mínimo 32 caracteres. Gere com `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Trocar a chave desloga todo mundo |
| `JWT_EXPIRACAO` | `24h` | validade do login (`24h`, `7d`…) |
| `PORT` | `8080` | porta HTTP |

Localmente elas podem ficar no arquivo `api/.env` (ignorado pelo git).

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/unidades?tipo=&servico=&busca=` | lista unidades com nota média e nº de avaliações. `tipo`: `Hospital`, `UPA`, `Posto`. `servico`: `Vacinas`, `Exames`, `Atendimentos`, `Medicamentos`. `busca`: nome, bairro, endereço ou serviço (ignora acento e maiúscula) |
| GET | `/api/unidades/{id}` | uma unidade |
| GET | `/api/unidades/{id}/avaliacoes?nota=&page=1&size=4` | avaliações paginadas (página começa em 1, `size` máx. 50). Resposta: `{ conteudo, pagina, tamanho, totalElementos, totalPaginas }` |
| GET | `/api/avaliacoes/{id}` | avaliação com os dados da unidade |
| POST | `/api/avaliacoes` | **exige login.** Cria avaliação; o autor é o usuário logado. Corpo: `{ data: "yyyy-MM-dd", unidadeId, nota: 1-5, comentario }` → `201` |
| POST | `/api/auth/cadastro` | `{ nome, email, senha }` → `201 { token, expiraEm, usuario }` (já entra logado) |
| POST | `/api/auth/login` | `{ email, senha }` → `{ token, expiraEm, usuario }` |
| GET | `/api/auth/me` | **exige login.** Devolve o usuário do token |

### Login

- Ler (todos os `GET` públicos) não exige conta. Enviar avaliação exige.
- O front guarda o token e envia `Authorization: Bearer <token>` só nas chamadas que exigem login. Nas leituras públicas a API ignora o token, então um token vencido nunca bloqueia a navegação.
- Senhas são guardadas com BCrypt (nunca em texto). O e-mail é único, sem diferenciar maiúsculas, e espaços nas pontas são removidos.
- E-mail inexistente e senha errada dão a mesma resposta (`401 "E-mail ou senha incorretos."`), para não revelar quem tem conta.
- Depois de 5 senhas erradas para o mesmo e-mail em 15 minutos, o login fica bloqueado até a janela passar (`429` com `Retry-After`). O contador fica em memória e zera quando a API reinicia.

| Situação | Resposta |
|---|---|
| campo vazio, e-mail inválido, senha curta | `400` com `campos` |
| e-mail já cadastrado | `409`, campo `email` |
| e-mail ou senha errados | `401 "E-mail ou senha incorretos."` |
| sem token numa rota protegida | `401 "Faça login para continuar."` |
| token vencido ou inválido | `401 "Sua sessão expirou. Entre novamente."` |
| excesso de tentativas | `429` |

Erros seguem o formato que o front espera:

```json
{ "mensagem": "Verifique os campos informados.", "campos": [{ "campo": "data", "mensagem": "A data não pode ser no futuro." }] }
```

`404` para unidade/avaliação inexistente, `400` para validação, `503` se o banco estiver fora.

## Banco de dados

Migrações em `src/main/resources/db/migration`:

- `V1__criar_tabelas.sql` — `unidade`, `unidade_servico`, `avaliacao` e a função `normalizar()` usada na busca.
- `V2__dados_iniciais.sql` — **dados fictícios de demonstração** (10 unidades no Recife e 30 avaliações). Substitua por dados oficiais (CNES/DATASUS) antes de usar com o público.
- `V3__usuarios.sql` — tabela `usuario` (login) e coluna `avaliacao.usuario_id`.

Para alterar o banco, crie um novo arquivo `V3__descricao.sql`; nunca edite uma migração que já rodou.

## Deploy (ex.: Render)

Há um `Dockerfile` pronto. Crie um *Web Service* a partir da pasta `api`, cadastre as variáveis acima (incluindo `CORS_ORIGINS` com a URL do front na Vercel) e, na Vercel, configure `VITE_API_URL` com a URL pública da API.
