import { userForm } from "../../hooks/userForm";
import { Global } from "../../helpers/Global";
import { useState } from "react";

export const Register = () => {
  const { form, changed } = userForm({});
  const [saved, setSaved] = useState("not_sended");

  const saveUser = async (e) => {
    e.preventDefault();
    //recoger datos de formulario
    let newUser = form;

    try {
      const request = await fetch(Global.url + "user/register", {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!request.ok) {
        throw new Error("Error en la solicitud al servidor");
      }

      const data = await request.json();
      console.log(data);

      if (data.status == "success") {
        setSaved("saved");
      } else {
        setSaved("error");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <header className="content__header content__header--public">
        <h1 className="content__title">Registro</h1>
      </header>

      <div className="content__posts">
        {saved == "saved" ? (
          <strong className="alert alert-success">
            {" "}
            Usuario registrado correctamente !!{" "}
          </strong>
        ) : (
          ""
        )}
        {saved === "error" ? (
          <strong className="alert alert-danger">
            El Usuario no se ha registrado !!
          </strong>
        ) : (
          ""
        )}

        <form className="register-form" onSubmit={saveUser}>
          <div className="form-froup">
            <label htmlFor="name">nombre</label>
            <input type="text" name="name" onChange={changed} />
          </div>

          <div className="form-froup">
            <label htmlFor="surname">Apellidos</label>
            <input type="text" name="apellidos" onChange={changed} />
          </div>

          <div className="form-froup">
            <label htmlFor="nick">Nick</label>
            <input type="text" name="nick" onChange={changed} />
          </div>

          <div className="form-froup">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" name="email" onChange={changed} />
          </div>

          <div className="form-froup">
            <label htmlFor="password">Contraseña</label>
            <input type="password" name="password" onChange={changed} />
          </div>

          <input type="submit" value="Registrate" className="btn-btn-success" />
        </form>
      </div>
    </>
  );
};
