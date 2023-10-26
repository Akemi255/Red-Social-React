
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Global } from "../../helpers/Global";
import { PublicationList } from "../publication/PublicationList";


export const Feed = () => {

  const params = useParams();
  const [publications, setPublications] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);
  const [showNewPublications, setShowNewPublications] = useState(false);

  useEffect(() => {
    // Obtener datos del usuario y sus publicaciones al cargar el componente
    loadUserData();
  }, [params]);


  const loadUserData = async () => {
    // Resetea las variables de estado
    setPublications([]);
    setMore(true);
    getPublications(1, false);
  };

  const getPublications = async (nextPage = 1, showNews = false) => {


    if (showNews) {
      setPublications([])
      setPage(1)
      nextPage = 1
    }



    const request = await fetch(
      Global.url + "publication/feed/" + nextPage,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      }
    );
    const data = await request.json();

    if (data.status === "success") {
      setPublications((prevPublications) => [
        ...prevPublications,
        ...data.publications,
      ]);

      setShowNewPublications(true);
      if (publications.length >= data.total) {
        setMore(false);
      }
    }
  };

  const refreshPublications = () => {
    setPage(1); // Reiniciar la página a 1
    setPublications([]); // Limpiar la lista de publicaciones
    getPublications(1); // Obtener todas las publicaciones desde la página 1
  };

  return (
    <>
      <header className="content__header">
        <h1 className="content__title">Timeline</h1>
        
        <button className="content__button" onClick={refreshPublications}>Mostrar Nuevas</button>
      </header>

      <PublicationList 
        publications={publications}
        setPublications={setPublications}
        getPublications={getPublications}
        page={page}
        setPage={setPage}
        more={more}
        setMore={setMore}
        showNewPublications={showNewPublications}
        setShowNewPublications={setShowNewPublications}
     />

    </>
  );
};
