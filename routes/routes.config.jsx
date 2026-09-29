import { createBrowserRouter } from "react-router-dom";

import Home from "../pages/Home";
import ListaUnidades from "../pages/ListaUnidades";
import ListaAvaliacoes from "../pages/ListaAvaliacoes";
import RegistroAvaliacoes from "../pages/RegistroAvaliacoes";

export const router = createBrowserRouter([
    {path: "/", element: <Home />, },
    {path: "/lista-unidades", element: <ListaUnidades />, },
    { path: "/lista-avaliacoes", element: <ListaAvaliacoes />, },
    { path: "/registro-avaliacoes", element: <ListaAvaliacoes />, },
]);
