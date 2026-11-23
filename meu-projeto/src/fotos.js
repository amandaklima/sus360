// Foto da unidade: usa a que veio da API; sem foto, mostra a ilustração do tipo.
const PADRAO = {
    Hospital: "/unidades/hospital.svg",
    UPA: "/unidades/upa.svg",
    Posto: "/unidades/posto.svg",
};

export const fotoDaUnidade = (u) => u?.foto || PADRAO[u?.tipo] || "/unidades/servicos.svg";
