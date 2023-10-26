import { useEffect, useState } from "react";
import avatar from "../../assets/img/user.png";
import { GetProfile } from "../../helpers/getProfile";
import { Link, useParams } from "react-router-dom";
import { Global } from "../../helpers/Global";
import useAuth from "../../hooks/useAuth";
import { PublicationList } from "../publication/PublicationList";

export const Profile = () => {
  const [user, setUser] = useState({});
  const [counters, setCounters] = useState({});
  const params = useParams();
  const { auth } = useAuth();
  const [iFollow, setIFollow] = useState(false);
  const [publications, setPublications] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(true);

  useEffect(() => {
    // Obtener datos del usuario y sus publicaciones al cargar el componente
    loadUserData();
  }, [params]);

  const loadUserData = async () => {
    // Resetea las variables de estado
    setUser({});
    setCounters({});
    setPublications([]);
    setMore(true);

    // Obtiene datos del usuario y sus seguidores
    const dataUser = await GetProfile(params.userId, setUser);
    
    if (dataUser.following) {
      setIFollow(true);
    }

    // Obtiene los contadores del usuario
    getCounters();
    // Obtiene las publicaciones del usuario
    getPublications(1);
  };

  const getCounters = async () => {
    const request = await fetch(Global.url + "user/counters/" + params.userId, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    });
    const data = await request.json();

    if (data.following) {
      setCounters(data);
    }
  };

  const follow = async (userId) => {
    const request = await fetch(Global.url + "follow/save", {
      method: "POST",
      body: JSON.stringify({ followed: userId }),
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    });

    const data = await request.json();

    if (data.status === "success") {
      setIFollow(true);
    }
  };

  const unfollow = async (userId) => {
    const request = await fetch(Global.url + "follow/unfollow/" + userId, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    });

    const data = await request.json();

    if (data.status === "success") {
      setIFollow(false);
    }
  };

  const getPublications = async (nextPage = 1) => {
    const request = await fetch(
      Global.url + "publication/user/" + params.userId + "/" + nextPage,
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

      console.log(publications);
      if (publications.length >= data.total) {
        setMore(false);
      }
    }
  };


  

  return (
    <>
      <header className="aside__profile-info">
        <div className="profile-info__general-info">
          <div className="general-info__container-avatar">
            {user.image && user.image !== "default.png" ? (
              <img
                src={Global.url + "user/avatar/" + user.image}
                className="container-avatar__img"
                alt="Foto de perfil"
              />
            ) : (
              <img
                src={avatar}
                className="container-avatar__img"
                alt="Foto de perfil"
              />
            )}
          </div>

          <div className="general-info__container-names">
            <div className="container-names__name">
              <h1>
                {user.name} {user.surname}
              </h1>
              {user._id != auth._id &&
                (iFollow ? (
                  <button
                    onClick={() => unfollow(user._id)}
                    className="content__button content__button--right post__button"
                  >
                    Dejar de seguir
                  </button>
                ) : (
                  <button
                    onClick={() => follow(user._id)}
                    className="content__button content__button--right"
                  >
                    Seguir
                  </button>
                ))}
            </div>
            <h2 className="container-names__nickname">{user.nick}</h2>
            <p>{user.bio}</p>
          </div>
        </div>

        <div className="profile-info__stats">
          <div className="stats__following">
            <Link
              to={"/social/siguiendo/" + user._id}
              className="following__link"
            >
              <span className="following__title">Siguiendo</span>
              <span className="following__number">
                {counters.following >= 1 ? counters.following : 0}
              </span>
            </Link>
          </div>
          <div className="stats__following">
            <Link
              to={"/social/seguidores/" + user._id}
              className="following__link"
            >
              <span className="following__title">Seguidores</span>
              <span className="following__number">
                {counters.followed >= 1 ? counters.followed : 0}
              </span>
            </Link>
          </div>

          <div className="stats__following">
            <Link to={"/social/perfil/" + user._id} className="following__link">
              <span className="following__title">Publicaciones</span>
              <span className="following__number">
                {counters.publications >= 1 ? counters.publications : 0}
              </span>
            </Link>
          </div>
        </div>
      </header>

     <PublicationList 
        publications={publications}
        setPublications={setPublications}
        getPublications={getPublications}
        page={page}
        setPage={setPage}
        more={more}
        setMore={setMore}
     />

     

      <br />
    </>
  );
};
