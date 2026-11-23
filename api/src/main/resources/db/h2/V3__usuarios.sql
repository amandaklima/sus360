-- SUS360 — contas de usuário (login) para o banco EM MEMÓRIA (H2).
-- Espelha db/migration/V3 (PostgreSQL). O H2 não tem índice por expressão, então o e-mail usa
-- coluna gerada email_chave (= lower(email)) com índice único: sem diferenciar maiúsculas, como no Postgres.

create table usuario (
    id         bigint generated always as identity primary key,
    nome       varchar(100) not null,
    email      varchar(255) not null,
    email_chave varchar(255) generated always as (lower(email)),
    senha_hash varchar(100) not null, -- BCrypt; a senha em texto nunca é gravada
    criado_em  timestamp with time zone not null default now()
);

create unique index uq_usuario_email on usuario (email_chave);

alter table avaliacao
    add column usuario_id bigint references usuario (id) on delete set null;

create index idx_avaliacao_usuario on avaliacao (usuario_id);
