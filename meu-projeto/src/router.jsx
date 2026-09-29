import { createBrowserRouter } from "react-router-dom";

import Home from "./Home";
import ListaUnidades from "./ListaUnidades";
import ListaAvaliacoes from "./ListaAvaliacoes";
import RegistrarAvaliacao from "./RegistrarAvaliacao";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/lista-unidades",
        element: <ListaUnidades />,
    },
    {
        path: "/lista-avaliacoes",
        element: <ListaAvaliacoes />,
    },
    {
        path: "/registro-avaliacoes",
        element: <RegistrarAvaliacao />,
    },
]);