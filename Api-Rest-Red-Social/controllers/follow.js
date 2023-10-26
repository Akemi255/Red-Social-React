const Follow = require("../models/follow");
const User = require("../models/user");
const mongoosePaginate = require("mongoose-pagination")
//importar servicio
const followService = require("../services/followService");


//acciones de prueba

const pruebaFollow = (req,res) => {
    return res.status(200).send({
     message: "Mensaje enviado desde: controller/user.js"
    });
 }

 //accion de seguir
 const save = async (req, res) => {
    try {
        // Conseguir datos por body
        const params = req.body;

        // Sacar id del usuario identificado
        const identity = req.user;

        // Crear objeto con modelo follow
        const userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        });

        // Guardar objeto en bbdd usando await
        const followStored = await userToFollow.save();

        if (!followStored) {
            return res.status(404).send({
                status: "error",
                message: "No se ha podido seguir al usuario",
                follow: followStored
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Método dar follow",
            identity: req.user,
            follow: followStored
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor",
            error: error.message
        });
    }
};


 //accion de borrar follow 
 const unfollow = async (req, res) => {
    try {
        // Recoger el id del usuario
        const userId = req.user.id;

        // Recoger id del usuario que sigo y quiero dejar de seguir
        const followedId = req.params.id;

        // Buscar y eliminar las coincidencias usando await
        const followDeleted = await Follow.findOneAndRemove({
            "user": userId,
            "followed": followedId
        });

        if (!followDeleted) {
            return res.status(404).send({
                status: "error",
                message: "No has dejado de seguir a nadie",
                followDeleted
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Método dar unfollow",
            followDeleted
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor",
            error: error.message
        });
    }
};


 //listado de usuarios que estoy siguiendo (siguiendo)
 const following = async (req, res) => {
    try {
        // Sacar id del usuario identificado
        let userId = req.user.id;

        // Comprobar si me llega el id por url
        if (req.params.id) {
            userId = req.params.id;
        }

        // Comprobar si me llega la página, si no la página es 1
        let page = 1;

        if (req.params.page) {
            page = req.params.page;
        }

        // Cuántos usuarios por página quiero mostrar
        const itemsPerPage = 5;

        // Obtener el array de ids de los usuarios que sigo
        const follows = await Follow.find({ user: userId }).populate("user followed", "-password -role -__v -email").exec();

        // Paginar el array de ids usando el método slice
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedFollows = follows.slice(startIndex, endIndex);


        let followUserIds = await followService.followUserIds(req.user.id)
       
  


        // Agregar las propiedades total y pages al objeto JSON de respuesta
        const response = {
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows: paginatedFollows,
            total: follows.length, // Total de elementos
            pages: Math.ceil(follows.length / itemsPerPage), // Número total de páginas
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        };

        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor",
            error: error.message
        });
    }
};



 //listado de usuarios que siguen a otro usuario (soy seguido, mis seguidores)

const followers = async (req,res) => {

    try {
        // Sacar id del usuario identificado
        let userId = req.user.id;

        // Comprobar si me llega el id por url
        if (req.params.id) {
            userId = req.params.id;
        }

        // Comprobar si me llega la página, si no la página es 1
        let page = 1;

        if (req.params.page) {
            page = req.params.page;
        }

        // Cuántos usuarios por página quiero mostrar
        const itemsPerPage = 5;

        // Obtener el array de ids de los usuarios que sigo
        const follows = await Follow.find({ followed: userId }).populate("user followed", "-password -role -__v -email").exec();

        // Paginar el array de ids usando el método slice
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedFollows = follows.slice(startIndex, endIndex);


        let followUserIds = await followService.followUserIds(req.user.id)
       
  


        // Agregar las propiedades total y pages al objeto JSON de respuesta
        const response = {
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows: paginatedFollows,
            total: follows.length, // Total de elementos
            pages: Math.ceil(follows.length / itemsPerPage), // Número total de páginas
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        };

        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en el servidor",
            error: error.message
        });
    }
};





 module.exports = {
     pruebaFollow,
     save,
     unfollow,
     following,
     followers
 }