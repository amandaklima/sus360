-- SUS360 — estrutura inicial para o banco EM MEMÓRIA (H2).
-- Espelha db/migration/V1 (PostgreSQL). Usado só quando a API não consegue conectar no Supabase.

-- Normaliza texto para busca: minúsculas e sem acento ("São" → "sao"). Mesma regra da função do Postgres.
create alias normalizar for "br.unicap.sus360.comum.Texto.normalizar";

create table unidade (
    id        bigint generated always as identity primary key,
    nome      varchar(150) not null,
    tipo      varchar(20)  not null check (tipo in ('Hospital', 'UPA', 'Posto')),
    endereco  varchar(255) not null,
    bairro    varchar(100) not null,
    cidade    varchar(100) not null default 'Recife',
    uf        char(2)      not null default 'PE',
    horario   varchar(120) not null,
    telefone  varchar(30),
    foto      varchar(500),
    cnes      varchar(7) unique,
    criado_em timestamp with time zone not null default now()
);

create index idx_unidade_tipo on unidade (tipo);

create table unidade_servico (
    id         bigint generated always as identity primary key,
    unidade_id bigint       not null references unidade (id) on delete cascade,
    categoria  varchar(20)  not null check (categoria in ('Vacinas', 'Exames', 'Atendimentos', 'Medicamentos')),
    nome       varchar(150) not null,
    unique (unidade_id, nome)
);

create index idx_unidade_servico_categoria on unidade_servico (categoria, unidade_id);

create table avaliacao (
    id               bigint generated always as identity primary key,
    unidade_id       bigint       not null references unidade (id) on delete cascade,
    autor            varchar(100) not null,
    nota             smallint     not null check (nota between 1 and 5),
    data_atendimento date         not null,
    texto            varchar(500) not null,
    criado_em        timestamp with time zone not null default now()
);

create index idx_avaliacao_unidade on avaliacao (unidade_id, data_atendimento desc, id desc);
