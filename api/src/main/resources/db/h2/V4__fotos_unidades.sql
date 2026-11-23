-- SUS360 — fotos de demonstração das unidades.
-- As imagens são ilustrações que ficam no front (meu-projeto/public/unidades/) e o caminho é relativo ao site.
-- Para usar fotos reais depois, troque a coluna foto por uma URL completa (https://...) de cada unidade.

update unidade set foto = '/unidades/hospital-1.svg' where nome = 'Hospital Geral da Boa Vista';
update unidade set foto = '/unidades/hospital-2.svg' where nome = 'Hospital Municipal do Cordeiro';
update unidade set foto = '/unidades/hospital-3.svg' where nome = 'Hospital Regional de Afogados';
update unidade set foto = '/unidades/upa-1.svg'      where nome = 'UPA 24h Imbiribeira';
update unidade set foto = '/unidades/upa-2.svg'      where nome = 'UPA 24h Torrões';
update unidade set foto = '/unidades/upa-3.svg'      where nome = 'UPA 24h Nova Descoberta';
update unidade set foto = '/unidades/posto-1.svg'    where nome = 'Posto de Saúde Casa Amarela';
update unidade set foto = '/unidades/posto-2.svg'    where nome = 'Unidade Básica de Saúde Boa Viagem';
update unidade set foto = '/unidades/posto-3.svg'    where nome = 'Posto de Vacinação Encruzilhada';
update unidade set foto = '/unidades/posto-4.svg'    where nome = 'Unidade de Saúde da Família Várzea';
