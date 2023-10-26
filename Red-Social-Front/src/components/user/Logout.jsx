import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../../hooks/useAuth";



export const Logout = () => {

  const {setAuth, setCounters} = useAuth();
  const navigate = useNavigate();



  useEffect(() => {

  //vaciar el localStorage
  localStorage.clear();

  //setear estados globaloes a vacios
  setAuth({})
  setCounters({})
  //navigate al login
  navigate("/login");
  });
  
  
  
  
  return (
    <h1>Cerrando sesión</h1>
  )
}
