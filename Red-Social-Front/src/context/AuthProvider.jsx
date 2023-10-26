import { createContext } from "react";
import { useState, useEffect } from "react";
import { Global } from "../helpers/Global";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const[auth, setAuth] = useState({})
const[counters, setCounters] = useState({})
const [loading, setLoading] = useState(true)


useEffect(() => {
  authUser();

  
}, [])

const authUser = async() => {
//sacar datos del usuario del localStorage
const token =localStorage.getItem("token");
const user = localStorage.getItem("user");

//comprobar si tengo el token
if (!token || !user) {
    setLoading(false);
    return false;
}

//transformar los datos a un objeto de js
const userObj = JSON.parse(user);
const userId = userObj.id;

//peticion ajax que comprueba el token
const request = await fetch(Global.url + "user/profile/" + userId, {
    method: "GET",
    headers: {
        "content-type": "application/json",
        "Authorization": token
    }
});

const data = await request.json();


//peticion para contadores
const requestCounters = await fetch(Global.url + "user/counters/" + userId, {
    method: "GET",
    headers: {
        "content-type": "application/json",
        "Authorization": token
    }
});

const dataCounters = await requestCounters.json();

//sacar el estado de auth
setAuth(data.user);
setCounters(dataCounters)
setLoading(false);
}

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        counters,
        setCounters,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;