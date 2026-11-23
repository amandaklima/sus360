-- SUS360 — dados de demonstração.
-- ATENÇÃO: unidades, endereços, telefones e avaliações abaixo são FICTÍCIOS, só para o protótipo funcionar.
-- Substitua pelos dados oficiais (ex.: CNES/DATASUS) antes de usar com o público.

insert into unidade (nome, tipo, endereco, bairro, horario, telefone) values
    ('Hospital Geral da Boa Vista',       'Hospital', 'Rua da Saudade, 120 – Boa Vista, Recife',                 'Boa Vista',      'Aberto 24 horas',            '(81) 3355-0101'),
    ('Hospital Municipal do Cordeiro',    'Hospital', 'Av. Caxangá, 2500 – Cordeiro, Recife',                    'Cordeiro',       'Aberto 24 horas',            '(81) 3355-0102'),
    ('Hospital Regional de Afogados',     'Hospital', 'Rua São Miguel, 800 – Afogados, Recife',                  'Afogados',       'Aberto 24 horas',            '(81) 3355-0103'),
    ('UPA 24h Imbiribeira',               'UPA',      'Av. Mascarenhas de Morais, 4000 – Imbiribeira, Recife',   'Imbiribeira',    'Aberto 24 horas',            '(81) 3355-0201'),
    ('UPA 24h Torrões',                   'UPA',      'Rua Bom Pastor, 300 – Torrões, Recife',                   'Torrões',        'Aberto 24 horas',            '(81) 3355-0202'),
    ('UPA 24h Nova Descoberta',           'UPA',      'Av. Norte, 7000 – Nova Descoberta, Recife',               'Nova Descoberta','Aberto 24 horas',            '(81) 3355-0203'),
    ('Posto de Saúde Casa Amarela',       'Posto',    'Estrada do Arraial, 3100 – Casa Amarela, Recife',         'Casa Amarela',   'Seg. a sex., 7h às 17h',     '(81) 3355-0301'),
    ('Unidade Básica de Saúde Boa Viagem','Posto',    'Rua Barão de Souza Leão, 500 – Boa Viagem, Recife',       'Boa Viagem',     'Seg. a sex., 7h às 19h',     '(81) 3355-0302'),
    ('Posto de Vacinação Encruzilhada',   'Posto',    'Av. Beberibe, 200 – Encruzilhada, Recife',                'Encruzilhada',   'Seg. a sáb., 8h às 17h',     '(81) 3355-0303'),
    ('Unidade de Saúde da Família Várzea','Posto',    'Av. Afonso Olindense, 1500 – Várzea, Recife',             'Várzea',         'Seg. a sex., 7h às 16h',     '(81) 3355-0304');

insert into unidade_servico (unidade_id, categoria, nome)
select u.id, s.categoria, s.nome
from (values
    -- Hospitais
    ('Hospital', 'Atendimentos', 'Pronto-socorro'),
    ('Hospital', 'Atendimentos', 'Consultas especializadas'),
    ('Hospital', 'Atendimentos', 'Internação'),
    ('Hospital', 'Exames',       'Raio-X'),
    ('Hospital', 'Exames',       'Tomografia'),
    ('Hospital', 'Exames',       'Exames laboratoriais'),
    ('Hospital', 'Medicamentos', 'Farmácia hospitalar'),
    -- UPAs
    ('UPA',      'Atendimentos', 'Urgência e emergência'),
    ('UPA',      'Atendimentos', 'Clínico geral'),
    ('UPA',      'Atendimentos', 'Pediatria'),
    ('UPA',      'Exames',       'Raio-X'),
    ('UPA',      'Exames',       'Eletrocardiograma'),
    ('UPA',      'Exames',       'Exames laboratoriais'),
    ('UPA',      'Medicamentos', 'Medicação de urgência'),
    -- Postos
    ('Posto',    'Vacinas',      'Vacina da gripe'),
    ('Posto',    'Vacinas',      'Vacina contra COVID-19'),
    ('Posto',    'Vacinas',      'Febre amarela'),
    ('Posto',    'Vacinas',      'Calendário de vacinação infantil'),
    ('Posto',    'Atendimentos', 'Consulta clínica'),
    ('Posto',    'Atendimentos', 'Pré-natal'),
    ('Posto',    'Exames',       'Teste rápido de HIV e sífilis'),
    ('Posto',    'Medicamentos', 'Farmácia básica')
) as s(tipo, categoria, nome)
join unidade u on u.tipo = s.tipo
-- o posto de vacinação não faz pré-natal nem consulta clínica
where not (u.nome = 'Posto de Vacinação Encruzilhada' and s.nome in ('Pré-natal', 'Consulta clínica'));

-- Hospitais também vacinam (campanhas)
insert into unidade_servico (unidade_id, categoria, nome)
select id, 'Vacinas', 'Vacina da gripe' from unidade where nome = 'Hospital Geral da Boa Vista';

insert into avaliacao (unidade_id, autor, nota, data_atendimento, texto)
select u.id, a.autor, a.nota, a.data_atendimento, a.texto
from (values
    ('Hospital Geral da Boa Vista', 'Maria S.',    5, date '2026-10-28', 'Fui atendida rápido na emergência. Equipe muito atenciosa e o ambiente estava limpo.'),
    ('Hospital Geral da Boa Vista', 'João P.',     4, date '2026-10-15', 'Atendimento bom, mas a espera para o raio-X foi de quase duas horas.'),
    ('Hospital Geral da Boa Vista', 'Ana C.',      3, date '2026-09-30', 'Médicos bons, porém faltavam cadeiras na recepção e o banheiro estava sem papel.'),
    ('Hospital Geral da Boa Vista', 'Carlos M.',   5, date '2026-09-12', 'Meu pai ficou internado uma semana e foi muito bem cuidado. Agradeço à enfermagem.'),
    ('Hospital Geral da Boa Vista', 'Fernanda L.', 2, date '2026-08-20', 'Esperei mais de cinco horas para ser chamada. Faltou informação sobre a fila.'),
    ('Hospital Geral da Boa Vista', 'Paulo R.',    4, date '2026-08-02', 'Consulta com o especialista foi pontual. Só achei difícil marcar o retorno.'),

    ('Hospital Municipal do Cordeiro', 'Luciana T.', 4, date '2026-10-22', 'Fiz tomografia no mesmo dia. Organização melhorou bastante.'),
    ('Hospital Municipal do Cordeiro', 'Roberto A.', 2, date '2026-10-05', 'O site dizia que tinha ortopedista, mas não havia nenhum de plantão.'),
    ('Hospital Municipal do Cordeiro', 'Juliana F.', 3, date '2026-09-18', 'Atendimento ok, mas a farmácia estava sem o remédio que me receitaram.'),

    ('Hospital Regional de Afogados', 'Marcos V.',  5, date '2026-10-30', 'Excelente atendimento na pediatria, minha filha foi muito bem tratada.'),
    ('Hospital Regional de Afogados', 'Patrícia N.',4, date '2026-09-25', 'Recepção educada e triagem rápida.'),

    ('UPA 24h Imbiribeira', 'Rafael G.',   3, date '2026-11-01', 'Demorou, mas resolveram meu problema. Poderia ter mais clínicos à noite.'),
    ('UPA 24h Imbiribeira', 'Camila D.',   5, date '2026-10-19', 'Fui atendida em 20 minutos, com eletrocardiograma na hora.'),
    ('UPA 24h Imbiribeira', 'Diego S.',    1, date '2026-10-03', 'Fiquei seis horas esperando com febre alta e ninguém dava previsão.'),
    ('UPA 24h Imbiribeira', 'Beatriz O.',  4, date '2026-09-14', 'Equipe de enfermagem muito cuidadosa com meu filho.'),
    ('UPA 24h Imbiribeira', 'Thiago H.',   2, date '2026-08-27', 'Ar-condicionado quebrado na sala de espera, calor insuportável.'),

    ('UPA 24h Torrões', 'Renata B.',  4, date '2026-10-26', 'Atendimento rápido para uma madrugada de domingo.'),
    ('UPA 24h Torrões', 'Gustavo E.', 3, date '2026-09-21', 'O médico foi atencioso, mas o raio-X estava em manutenção.'),

    ('UPA 24h Nova Descoberta', 'Aline K.',   2, date '2026-10-11', 'Faltou medicação para dor e tive que comprar na farmácia.'),
    ('UPA 24h Nova Descoberta', 'Eduardo C.', 4, date '2026-09-08', 'Bom atendimento, triagem bem explicada.'),

    ('Posto de Saúde Casa Amarela', 'Sandra M.', 5, date '2026-10-29', 'Tomei a vacina da gripe sem fila. Agentes de saúde muito simpáticas.'),
    ('Posto de Saúde Casa Amarela', 'Antônio J.',4, date '2026-10-08', 'Consegui consulta clínica na mesma semana.'),
    ('Posto de Saúde Casa Amarela', 'Vanessa P.',3, date '2026-09-16', 'Pré-natal bom, mas os exames demoram para chegar.'),

    ('Unidade Básica de Saúde Boa Viagem', 'Cláudia R.', 4, date '2026-10-24', 'Farmácia básica tinha todos os remédios de pressão.'),
    ('Unidade Básica de Saúde Boa Viagem', 'Henrique L.',2, date '2026-10-01', 'O horário informado era até as 19h, mas às 17h30 já não atendiam mais.'),

    ('Posto de Vacinação Encruzilhada', 'Larissa T.', 5, date '2026-11-03', 'Vacinação infantil super organizada, saímos em 15 minutos.'),
    ('Posto de Vacinação Encruzilhada', 'Mateus F.',  4, date '2026-10-17', 'Tinha vacina contra febre amarela, que estava em falta em outros postos.'),
    ('Posto de Vacinação Encruzilhada', 'Priscila A.',3, date '2026-09-29', 'Fila grande no sábado, mas andou rápido.'),

    ('Unidade de Saúde da Família Várzea', 'José B.',   5, date '2026-10-20', 'A equipe de saúde da família acompanha minha mãe em casa. Muito bom.'),
    ('Unidade de Saúde da Família Várzea', 'Simone G.', 3, date '2026-09-10', 'Atendimento bom, mas é difícil conseguir ficha cedo.')
) as a(unidade, autor, nota, data_atendimento, texto)
join unidade u on u.nome = a.unidade;
