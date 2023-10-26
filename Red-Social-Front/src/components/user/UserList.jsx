import avatar from "../../assets/img/user.png";
import useAuth from "../../hooks/useAuth";
import { Global } from "../../helpers/Global";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const UserList = ({ users, getUsers, following, setFollowing, page, setPage, more, loading }) => {
  const { auth } = useAuth();

  const nextPage = () => {
    const nextPageValue = page + 1;
    setPage(nextPageValue);
    getUsers(nextPageValue);
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

    if (data.status == "success") {
      setFollowing([...following, userId]);
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

    if (data.status == "success") {
      let filterFollowings = following.filter(
        (followingUserId) => String(userId) !== String(followingUserId)
      );
      setFollowing(filterFollowings);
    }
  };

  return (
    <>
      <div className="content__posts">
        {users.map((user) => {
          return (
            <article className="posts__post" key={user._id + user.created_at + Math.random()}>
              <div className="post__container">
                <div className="post__image-user">
                  <Link to={"/social/perfil/" + user._id} className="post__image-link">
                    {user.image !== "default.png" && (
                      <img
                        src={Global.url + "user/avatar/" + user.image}
                        className="post__user-image"
                        alt="Foto de perfil"
                      />
                    )}
                    {user.image === "default.png" && (
                      <img
                        src={avatar}
                        className="post__user-image"
                        alt="Foto de perfil"
                      />
                    )}
                  </Link>
                </div>

                <div className="post__body">
                  <div className="post__user-info">
                  <Link to={"/social/perfil/" + user._id} className="user-info__name">
                      {user.name} {user.surname}
                    </Link>
                    <span className="user-info__divider"> | </span>
                    <Link to={"/social/perfil/" + user._id} className="user-info__create-date">
                      {user.created_at}
                    </Link>
                  </div>

                  <h4 className="post__content">{user.bio}</h4>
                </div>
              </div>
              {user._id !== auth.id && (
                <div className="post__buttons">
                  {!following.includes(user._id) && (
                    <button
                      className="post__button post__button--green"
                      onClick={() => follow(user._id)}
                    >
                      Seguir
                    </button>
                  )}
                  {following.includes(user._id) && (
                    <button
                      className="post__button"
                      onClick={() => unfollow(user._id)}
                    >
                      Dejar de Seguir
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {loading ? "Cargando..." : ""}
      <div className="content__container-btn">
        {more && (
          <button className="content__btn-more-post" onClick={nextPage}>
            Ver más publicaciones
          </button>
        )}
      </div>
    </>
  );
};

UserList.propTypes = {
  users: PropTypes.array.isRequired, // Debe ser un array
  getUsers: PropTypes.func.isRequired,
  following: PropTypes.array.isRequired, // Debe ser un array
  setFollowing: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired, // Debe ser un número
  setPage: PropTypes.func.isRequired,
  more: PropTypes.bool.isRequired, // Debe ser un booleano
  loading: PropTypes.bool.isRequired, // Debe ser un booleano
};