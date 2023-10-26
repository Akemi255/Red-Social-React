import { Navigate, Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import useAuth from "../../../hooks/useAuth";

export const PrivateLayout = () => {
  const { auth } = useAuth();
  const {loading} = useAuth();


  if (loading) {
    return <h1>Cargando...</h1>;
  } else {
    return (
      <>
        {/*Layout*/}
        <Header />

        {/*Contenido principal*/}
        <section className="layout_content">
          {auth._id ? <Outlet /> : <Navigate to="/login" />}
        </section>

        {/*Barra lateral*/}
        <Sidebar />
      </>
    );
  }
};
