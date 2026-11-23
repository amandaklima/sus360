-- SUS360 — contas de usuário (login).

create table usuario (
    id         bigint generated always as identity primary key,
    nome       varchar(100) not null,
    email      varchar(255) not null,
    senha_hash varchar(100) not null, -- BCrypt; a senha em texto nunca é gravada
    criado_em  timestamptz  not null default now()
);

-- e-mail único sem diferenciar maiúsculas
create unique index uq_usuario_email on usuario (lower(email));

-- avaliações novas ficam ligadas a quem enviou; as de demonstração ficam sem usuário
alter table avaliacao
    add column usuario_id bigint references usuario (id) on delete set null;

create index idx_avaliacao_usuario on avaliacao (usuario_id);
