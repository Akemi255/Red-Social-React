//importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

//importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

//middleware de autenticacion
exports.auth = (req, res, next) => {
  //comprobar si llega cabecera de auth
   if (!req.headers.authorization) {
     return res.status(403).send({
        status: "error",
        message: "la peticion no tiene la cabecera de autenticacion"
     })
   }
  //limpiar token
  let token = req.headers.authorization.replace(/['"]+/g, '');
  
  
  //decodificar token
  try{
  
   let payload = jwt.decode(token, secret);
   //agregar datos a la request
    req.user = payload;
    console.log("req.user:", req.user);

   //comprobar expiración de token
   if (payload.exp <= moment().unix()) {
    return res.status(404).send({
        status: "error",
        message: "token expirado",
        
     })
      
   }


  }catch (error){
     return res.status(404).send({
        status: "error",
        message: "token invalido",
        error 
     })
  }


  

  //pasar a ejecucion
  next();
};
