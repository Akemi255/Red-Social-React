const Follow = require("../models/follow");

const followUserIds = async (identityUserId) => {
  
    //sacar informacion de seguimiento
    let following = await Follow.find({ "user": identityUserId }).select({
      _id: 0,
      created_at: 0,
      __v: 0,
      
    }).exec()

    let followers = await Follow.find({ "followed": identityUserId }).select({
      _id: 0,
      created_at: 0,
      __v: 0,
     
    }).exec()
    //procesar array identificadores
    let followingClean = [];

    following.forEach((Follow) => {
      followingClean.push(Follow.followed);
    });

    let followersClean = [];

    followers.forEach((Follow) => {
      followersClean.push(Follow.user);
    });

    return {
      following: followingClean,
      followers: followersClean,
    };
 
};

const followThisUser = async (identityUserId, profileUserId) => {
  try {
    let following = await Follow.findOne({ "user": identityUserId, "followed" : profileUserId }).select({
      _id: 0,
      created_at: 0,
      __v: 0,
    });

    let followers = await Follow.findOne({ "user": profileUserId, "followed": identityUserId }).select({
      _id: 0,
      created_at: 0,
      __v: 0,
    });

    return {
      following,
      followers
    };
  } catch (error) {
    // Manejo de errores aquí, por ejemplo, puedes imprimir el error en la consola o lanzar una excepción personalizada.
    console.error("Error en followThisUser:", error);
    throw new Error("Error en followThisUser");
  }
};


module.exports = {
  followUserIds,
  followThisUser,
};
