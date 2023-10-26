const mongoose = require ("mongoose");

const connection = async() =>{
    try{
      await mongoose.connect("mongodb://127.0.0.1:27017/mi_redsocial");
      console.log("conectado a la bd: mi_redsocial")
    }
    catch(error){
     throw new Error("no se ha podido conectar a la base de datos")
    }
}

module.exports = connection
