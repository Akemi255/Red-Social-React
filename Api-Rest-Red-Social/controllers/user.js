//importar modulos
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Follow = require("../models/follow");
const Publication = require("../models/publication");
const jwt = require("../services/jwt");
const mongoosePaginate = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
const validate = require("../helpers/validate")

//acciones de prueba

const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controller/user.js",
    usuario: req.user,
  });
};

//registro de usuarios
const register = async (req, res) => {
  // Recoger datos de la petición
  let params = req.body;

  // Comprobar que llegan bien (+validación)
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

 




  try {

     //validacion avanzada
  validate.validate(params)



    // Control de usuarios duplicados
    const existingUsers = await User.find({
      $or: [
        { email: params.email.toLowerCase() },
        { nick: params.nick.toLowerCase() },
      ],
    });

    if (existingUsers && existingUsers.length >= 1) {
      return res.status(200).json({
        status: "error",
        message: "El usuario ya existe",
      });
    }

    //cifrar contraseña

    let pwd = await bcrypt.hash(params.password, 10);
    console.log(pwd);
    params.password = pwd;

    // Crear objeto de usuario con datos
    let user_to_save = new User(params);

    //guardar en la bbdd
    user_to_save
      .save()
      .then((userStored) => {
        if (!userStored) {
          throw new Error("Usuario no guardado");
        }
        // Devolver el resultado
        return res.status(200).json({
          status: "success",
          message: "usuario registrado correctamente",
          user: userStored,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: "error",
          message: "Error en el registro de usuario",
        });
      });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la consulta de usuarios",
    });
  }
};

const login = async (req, res) => {
  try {
    // Recoger parámetros
    let params = req.body;

    if (!params.email || !params.password) {
      return res.status(400).json({
        status: "error",
        message: "faltan datos por enviar",
      });
    }

    // Buscar en la bbdd si existe usuario
    const user = await User.findOne({ email: params.email });

    console.log("User from DB:", user); // Agregar esta línea

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "no existe el usuario",
      });
    }

    // En caso que exista, comprobar contraseña
    const pwd = await bcrypt.compare(params.password, user.password);

    if (!pwd) {
      return res.status(400).send({
        status: "error",
        mensaje: "no te has identificado correctamente",
      });
    }

    //conseguir token
    const token = jwt.createToken(user);

    //eliminar password del objeto

    // y generar un token si es correcta
    console.log(user);
    // Devolver datos de usuario
    return res.status(200).send({
      status: "success",
      message: "te has identificado correctamente",
      user: {
        id: user._id,
        name: user.name,
        nick: user.nick,
      },
      token,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      status: "error",
      message: "ocurrió un error en el servidor",
    });
  }
};

const profile = async (req, res) => {
  try {
    // Recibir el parámetro del id de usuario por url
    const id = req.params.id;

    // Consulta para sacar los datos del usuario
    const userProfile = await User.findById(id).select("-password -role");

    const followInfo = await followService.followThisUser(req.user.id, id);

    if (!userProfile) {
      return res.status(404).send({
        status: "error",
        message: "el usuario no existe",
      });
    }

    // Devolver los datos del usuario
    return res.status(200).send({
      status: "success",
      message: "datos del usuario obtenidos correctamente",
      user: userProfile,
      following: followInfo.following,
      follower: followInfo.followers,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      status: "error",
      message: "ocurrió un error en el servidor",
    });
  }
};

const list = async (req, res) => {
  try {
    const page = parseInt(req.params.page || 1);
    const itemsPerPage = 1;

    const users = await User.find()
      .sort("_id")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .exec();

    const filteredUsers = users.map((user) => {
      const { password, email, role, __v, ...filteredUser } = user.toObject();
      return filteredUser;
    });

    const total = await User.countDocuments({});
    const totalPages = Math.ceil(total / itemsPerPage);

    const followUserIds = await followService.followUserIds(req.user.id);

    if (users.length === 0) {
      return res.status(200).send({
        status: "success",
        users: [], // Devuelve un array vacío si no hay usuarios
        page,
        itemsPerPage,
        total,
        totalPages,
        user_following: followUserIds.following,
        user_follow_me: followUserIds.followers,
      });
    }

    return res.status(200).send({
      status: "success",
      users: filteredUsers,
      page,
      itemsPerPage,
      total,
      totalPages,
      user_following: followUserIds.following,
      user_follow_me: followUserIds.followers,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      status: "error",
      message: "Ocurrió un error en el servidor",
    });
  }
};




const update = async (req, res) => {
  try {
    // Recoger información del usuario
    const userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.imagen;

    // Comprobar si el usuario ya existe
    const existingUsers = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    let userIsset = false;

    existingUsers.forEach((user) => {
      if (user && user._id.toString() !== userIdentity.id) {
        userIsset = true;
      }
    });

    if (userIsset) {
      return res.status(500).json({
        status: "error",
        message: "El usuario ya existe",
      });
    }

    // Cifrar contraseña
    if (userToUpdate.password) {
      const hashedPassword = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = hashedPassword;
    } else {
      delete userToUpdate.password;
    }

    // Actualizar usuario en la base de datos (esto depende de cómo esté configurado el modelo)
    try {
      const userUpdated = await User.findByIdAndUpdate(
        userIdentity.id,
        userToUpdate,
        { new: true }
      );

      if (!userUpdated) {
        return res.status(500).json({
          status: "error",
          message: "Error al actualizar usuario",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Usuario actualizado correctamente",
        user: userToUpdate,
        userUpdated,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error en el servidor",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en el servidor",
    });
  }
};

const util = require("util");
const unlinkAsync = util.promisify(fs.unlink);

const upload = async (req, res) => {
  try {
    // recoger el fichero de la imagen y comprobar que existe
    if (!req.file) {
      return res.status(404).json({
        status: "error",
        message: "la peticion no incluye la imagen",
      });
    }

    // conseguir el nombre del archivo
    const image = req.file.originalname;

    // sacar la extensión del archivo
    const imageSplit = image.split(".");
    const extension = imageSplit[1];

    // comprobar extensión
    if (!["png", "jpg", "jpeg", "gif", "jfif"].includes(extension)) {
      const filePath = req.file.path;
      await unlinkAsync(filePath); // Borrar archivo de manera asíncrona
      return res.status(400).json({
        status: "error",
        message: "la extension del fichero no es valida",
      });
    } else {
      // si es correcta, guardar imagen en la bbdd
      const userUpdated = await User.findOneAndUpdate(
        { _id: req.user.id }, // Asegúrate de pasar un objeto de filtro aquí
        { image: req.file.filename },
        { new: true }
      );

      if (!userUpdated) {
        return res.status(500).json({
          status: "error",
          message: "error en la subida del avatar",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "subida de imagen",
        user: userUpdated,
        file: req.file,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      status: "error",
      message: "ocurrió un error en el servidor",
    });
  }
};

const avatar = (req, res) => {
  //sacar el parametro de la url
  const file = req.params.file;

  //montar el path real de la imagen
  const filePath = "./uploads/avatars/" + file;

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

const counters = async (req, res) => {
  let userId = req.user.id;

  if (req.params.id) {
    userId = req.params.id;
  }

  try {
    const following = await Follow.count({ user: userId });

    const followed = await Follow.count({ followed: userId });

    const publications = await Publication.count({ user: userId });

    return res.status(200).send({
      userId,
      following: following,
      followed: followed,
      publications: publications,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error en los contadores",
      error,
    });
  }
};

module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
  counters,
};
