import { Global } from "./Global";



export const GetProfile = async (userId, setState) => {
  const request = await fetch(Global.url + "user/profile/" + userId, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("token"),
    },
  });

  if (request.ok) {
    const data = await request.json();

    if (data.status === "success" && data.user) {
      setState(data.user);
    }

    return data;
  } else {
    // Manejo de errores en caso de que la solicitud no sea exitosa
    console.error("Error en la solicitud de perfil");
    return { status: "error", message: "Error en la solicitud de perfil" };
  }
};
