//importar dependencias
const connection = require("./database/connection");
const express = require ("express");
const cors = require ("cors");

//mensaje bienvenida
console.log("api node iniciada")

//conexion a base de datos
connection();

//crear servidor de node
const app = express();
const puerto = 3000;

//configurar el cors
app.use(cors());

//convertir datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//cargar conf de rutas
const UserRoutes = require("./routes/user")
const FollowRoutes = require("./routes/follow")
const PublicationRoutes = require("./routes/publication")

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

//ruta de prueba
app.get("/ruta-prueba",(req,res) =>{
    return res.status(200).json({
        "id": 1,
        "nombre": "Victor",
        "web": "gustavo"
    })
})

//poner servidor a escuchar peticiones http
app.listen(puerto, () =>{
  console.log("servidor de node corriendo en el puerto ", puerto)
});










console.log('app iniciada');