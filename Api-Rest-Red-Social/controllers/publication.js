const publication = require("../models/publication");
const Publication = require("../models/publication");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
//acciones de prueba

const pruebaPublication = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controller/user.js",
  });
};

//guardar publicacion
const save = async (req, res) => {
  try {
    // Recoger datos del body
    const params = req.body;

    // Si no se envía el texto de la publicación, devuelve una respuesta negativa
    if (!params.text) {
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el texto de la publicación",
      });
    }

    // Crear y rellenar el objeto del modelo
    const newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // Guardar el objeto en la base de datos
    const publicationStored = await newPublication.save();

    if (!publicationStored) {
      throw new Error("No se ha guardado la publicación");
    }

    // Respuesta
    return res.status(200).send({
      status: "success",
      message: "Publicación guardada",
      publicationStored,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: error.message,
    });
  }
};

//sacar una publicacion
const detail = async (req, res) => {
  try {
    // Sacar el ID de la publicación
    const publicationId = req.params.id;

    // Buscar la publicación por ID
    const publicationStored = await Publication.findById(publicationId);

    if (!publicationStored) {
      return res.status(400).send({
        status: "error",
        message: "No existe la publicación",
      });
    }

    // Respuesta
    return res.status(200).send({
      status: "success",
      message: "Mostrar publicación",
      publication: publicationStored,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: "Ha ocurrido un error al buscar la publicación",
    });
  }
};

const remove = async (req, res) => {
  try {
    // Sacar ID de la publicación a eliminar
    const publicationId = req.params.id;

    // Buscar la publicación y eliminarla
    const deletedPublication = await Publication.findOneAndRemove({
      user: req.user.id,
      _id: publicationId,
    });

    if (!deletedPublication) {
      return res.status(400).send({
        status: "error",
        message:
          "No se ha encontrado la publicación o no tienes permisos para eliminarla",
      });
    }

    // Respuesta
    return res.status(200).send({
      status: "success",
      message: "Publicación eliminada",
      publication: deletedPublication,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ha ocurrido un error al eliminar la publicación",
    });
  }
};

//listar publicaciones de un usuario
const user = async (req, res) => {
  try {
    // Sacar ID de usuario
    const userId = req.params.id;

    // Controlar la página
    let page = 1;

    if (req.params.page) {
      page = parseInt(req.params.page);
    }

    const itemsPerPage = 5;

    // Calcular el índice de inicio para la paginación
    const startIndex = (page - 1) * itemsPerPage;

    // Encontrar el total de publicaciones del usuario
    const totalPublications = await Publication.countDocuments({
      user: userId,
    }).exec();

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalPublications / itemsPerPage);

    // Verificar si no hay publicaciones
    if (totalPublications === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay publicaciones para este usuario",
      });
    }

    // Encontrar las publicaciones del usuario, ordenarlas por fecha descendente y paginar
    const publications = await Publication.find({ user: userId })
      .sort({ created_at: -1 }) // Ordenar por fecha descendente
      .populate("user", "-password -__v -role -email")
      .skip(startIndex)
      .limit(itemsPerPage)
      .exec();

    // Respuesta
    return res.status(200).send({
      status: "success",
      message: "Publicaciones del perfil de usuario",
      page: page,
      total: totalPublications,
      totalPages,
      publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Ha ocurrido un error al obtener las publicaciones del usuario",
    });
  }
};

//subir ficheros
const upload = async (req, res) => {
  try {
    // Sacar publicationID
    const publicationId = req.params.id;

    // Recoger el fichero de la imagen y comprobar que existe
    if (!req.file) {
      return res.status(404).json({
        status: "error",
        message: "La petición no incluye la imagen",
      });
    }

    // Conseguir el nombre del archivo
    const image = req.file.filename; // Usamos req.file.filename en lugar de req.file.originalname

    // Sacar la extensión del archivo
    const imageSplit = image.split(".");
    const extension = imageSplit[1];

    // Comprobar extensión
    if (!["png", "jpg", "jpeg", "gif", "jfif"].includes(extension)) {
      const filePath = req.file.path;
      await unlinkAsync(filePath); // Borrar archivo de manera asíncrona
      return res.status(400).json({
        status: "error",
        message: "La extensión del fichero no es válida",
      });
    } else {
      // Si es correcta, guardar imagen en la bbdd
      const publicationUpdated = await Publication.findOneAndUpdate(
        { _id: publicationId }, // Asegúrate de pasar un objeto de filtro aquí
        { file: image }, // Usamos req.file.filename como el nombre del archivo
        { new: true }
      );

      if (!publicationUpdated) {
        return res.status(500).json({
          status: "error",
          message: "Error en la subida del avatar",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Subida de imagen",
        publication: publicationUpdated,
        file: req.file,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Ocurrió un error en el servidor",
    });
  }
};


//listar todas las publicaciones (feed)
const feed = async (req, res) => {
    try {
      // Sacar la página actual
      let page = 1;
  
      if (req.params.page) {
        page = parseInt(req.params.page);
      }
  
      // Establecer el número de elementos por página
      const itemsPerPage = 5;
  
      // Sacar un array de identificadores de usuarios a los que sigo como usuario logeado
      const myFollows = await followService.followUserIds(req.user.id);
  
      // Calcular el índice de inicio para la paginación
      const startIndex = (page - 1) * itemsPerPage;
  
      // Encontrar las publicaciones de los usuarios que sigo, ordenar por fecha y paginar
      const publications = await Publication.find({
        user: { $in: myFollows.following }
      })
        .populate("user", "-password -role -__v -email")
        .sort("-created_at")
        .skip(startIndex)
        .limit(itemsPerPage)
        .exec();
  
      // Encontrar el total de publicaciones
      const totalPublications = await Publication.countDocuments({
        user: { $in: myFollows.following }
      }).exec();
  
      // Calcular el número total de páginas
      const totalPages = Math.ceil(totalPublications / itemsPerPage);
  
      // Respuesta
      return res.status(200).send({
        status: "success",
        message: "feed de publicaciones",
        following: myFollows.following,
        page: page,
        total: totalPublications,
        totalPages: totalPages,
        publications
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "No se han listado las publicaciones",
      });
    }
  };
  

//devolver archivos
const media = (req, res) => {
  //sacar el parametro de la url
  const file = req.params.file;

  //montar el path real de la imagen
  const filePath = "./uploads/publications/" + file;

  //comprobar que existe
  fs.stat(filePath, (error, exists) => {
    if (!exists) {
      return res.status(404).json({
        status: "error",
        message: "No existe la imagen",
      });
    }
    //devolver un file
    return res.sendFile(path.resolve(filePath));
  });
};

module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  user,
  upload,
  media,
  feed,
};
