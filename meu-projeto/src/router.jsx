import { createBrowserRouter, Navigate } from "react-router-dom";

import Home from "./Home";
import ListaUnidades from "./ListaUnidades";
import ListaAvaliacoes from "./ListaAvaliacoes";
import RegistrarAvaliacao from "./RegistrarAvaliacao";
import EnviarAvaliacao from "./EnviarAvaliacao";
import Login from "./Login";
import { RequireAuth } from "./auth";

const AVISO_AVALIAR = "Entre na sua conta para enviar uma avaliação.";

export const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/lista-unidades", element: <ListaUnidades /> },

    // avaliações de uma unidade (GET /api/unidades/:id/avaliacoes)
    { path: "/lista-avaliacoes/:id", element: <ListaAvaliacoes /> },
    { path: "/lista-avaliacoes", element: <Navigate to="/lista-unidades" replace /> },

    // detalhe de uma avaliação (GET /api/avaliacoes/:id)
    { path: "/registro-avaliacoes/:id", element: <RegistrarAvaliacao /> },

    // envio de avaliação (exige login); o :id pré-seleciona a unidade
    {
        path: "/enviar-avaliacao",
        element: <RequireAuth aviso={AVISO_AVALIAR}><EnviarAvaliacao /></RequireAuth>,
    },
    {
        path: "/enviar-avaliacao/:id",
        element: <RequireAuth aviso={AVISO_AVALIAR}><EnviarAvaliacao /></RequireAuth>,
    },

    // conta (?voltar=/caminho volta para onde a pessoa estava)
    // a key faz cada tela começar com o formulário limpo ao alternar entre entrar/criar conta
    { path: "/login", element: <Login key="login" modo="login" /> },
    { path: "/cadastro", element: <Login key="cadastro" modo="cadastro" /> },

    { path: "*", element: <Navigate to="/" replace /> },
]);
