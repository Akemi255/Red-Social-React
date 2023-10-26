import { userForm } from "../../hooks/userForm";
import { Global } from "../../helpers/Global";
import { useState } from "react";
import useAuth from "../../hooks/useAuth";

export const Login = () => {

 const { form, changed} = userForm({})
 const [saved, setSaved] = useState("not_sended")

 const {setAuth} = useAuth();

const loginUser = async(e) => {
  e.preventDefault();
  
  //datos de formulario
  let userToLogin = form;

  
  //peticion al backend 
  const request = await fetch(Global.url+"user/login",{
    method: "POST",
    body: JSON.stringify(userToLogin),
    headers: {
      "Content-Type":"application/json"
    }
  });
  
  const data = await request.json();
  
  if (data.status == "success") {
    setSaved("login")
    //persistir datos en el navegador
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    //set datos en el auth
    setAuth(data.user)

    //redirección
    setTimeout(()=>{
      window.location.reload();
    },1000)

  }else{
    setSaved("error")
  }

}



  return (
    <>
    <header className="content__header">
      <h1 className="content__title">Login</h1>
    </header>

    <div className="content__posts">
      <form className="form-login" onSubmit={loginUser}>

      {saved == "login" ? (
          <strong className="alert alert-success">
            {" "}
            Usuario identificado correctamente !!{" "}
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


      <div className="form-group">
        <label htmlFor="email">email</label>
        <input type="email" name="email" onChange={changed}/>
      </div>
 
      <div className="form-group">
        <label htmlFor="password">contraseña</label>
        <input type="password" name="password" onChange={changed}/>
      </div>

      <input type="submit" value="identificate" className="btn btn-success" />





      </form>
    </div>
  </>
  )
}
