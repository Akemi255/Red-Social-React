import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { Global } from "../../helpers/Global";
import avatar from "../../assets/img/user.png";
import { SerializeForm } from "../../helpers/SerializeForm";

export const Config = () => {
  const { auth, setAuth } = useAuth();

  const [saved, setSaved] = useState("not_saved");

  const updateUser = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    //recoger datos del formulario
    let newDataUser = SerializeForm(e.target);

    //borrar propiedad innecesaria
    delete newDataUser.file0;

    //actualizar usuario en la base de datos
    const request = await fetch(Global.url + "user/update", {
      method: "PUT",
      body: JSON.stringify(newDataUser),
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
    const data = await request.json();
    if (data.status == "success") {
      delete data.user.password;
      setAuth({ ...auth, ...data.user });
      delete data.user.password;
      setSaved("saved");
    } else {
      setSaved("error");
    }

   //subida de imagenes
   const fileInput = document.querySelector("#file")

   if (data.status == "success" && fileInput.files[0]) {
        //recoger imagen a subir
        const formData = new FormData();
        formData.append('file0', fileInput.files[0]);

        const uploadRequest = await fetch(Global.url + "user/upload", {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": token
            }
        });
      
        const uploadData = await uploadRequest.json();

        if (uploadData.status == "success" && uploadData.user) {
            
            delete uploadData.user.password
            setAuth(uploadData.user)
            setSaved("saved")
        }

   }

  };

  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Ajustes</h1>
      </header>
      <div className="content__posts">
        {saved == "saved" ? (
          <strong className="alert alert-success">
            Usuario actualizado correctamente !!
          </strong>
        ) : (
          ""
        )}
        {saved === "error" ? (
          <strong className="alert alert-danger">
            El Usuario no se ha actualizado !!
          </strong>
        ) : (
          ""
        )}

        <form className="config-form" onSubmit={updateUser}>
          <div className="form-froup">
            <label htmlFor="name">nombre</label>
            <input type="text" name="name" defaultValue={auth.name} />
          </div>

          <div className="form-froup">
            <label htmlFor="surname">Apellidos</label>
            <input type="text" name="apellidos" defaultValue={auth.surname} />
          </div>

          <div className="form-froup">
            <label htmlFor="nick">Nick</label>
            <input type="text" name="nick" defaultValue={auth.nick} />
          </div>

          <div className="form-froup">
            <label htmlFor="bio">Bio</label>
            <textarea name="bio" defaultValue={auth.bio} />
          </div>

          <div className="form-froup">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" name="email" defaultValue={auth.email} />
          </div>

          <div className="form-froup">
            <label htmlFor="password">Contraseña</label>
            <input type="password" name="password" />
          </div>

          <div className="form-froup">
            <label htmlFor="File0">Avatar</label>
            <div className="general-info__container-avatar">
              {auth.image != "default.png" && (
                <img
                  src={Global.url + "user/avatar/" + auth.image}
                  className="container-avatar__img"
                  alt="Foto de perfil"
                />
              )}
              {auth.image == "default.png" && (
                <img
                  src={avatar}
                  className="container-avatar__img"
                  alt="Foto de perfil"
                />
              )}
            </div>
            <br />
            <input type="file" name="file0" id="file" />
          </div>
          <br />
          <input type="submit" value="Actualizar" className="btn-btn-success" />
        </form>
        <br />
      </div>
    </>
  );
};
