const Imagen = require('../models/imagen');
const { v4: uuidv4 }=require('uuid');
const fs=require('fs');

const subirImagen= async(imagen,UsuarioID,id,res)=>{
    const img=imagen;
    const nombreCortado=img.name.split('.');
    const extensionArchivo=nombreCortado[nombreCortado.length-1];
    const nombreArchivo= uuidv4()+'.'+extensionArchivo;
    let path;
    let datos;
    if(id==1){
        path= './files/vehiculo/'+nombreArchivo;
        datos={ usuario: UsuarioID, img: nombreArchivo };
    }else{
        path= './files/carnet/'+nombreArchivo;
        datos={ usuario: UsuarioID, img: nombreArchivo };    
    }

    img.mv(path, async (err)=>{
        if(err){
            console.log(err);
            return res.status(500).json({
                ok:false,
                msg:'error en carga de imagen '+nombreCortado[0],
            })
        }
        const imagen = new Imagen(datos);
        await imagen.save();
        return true;
    })
}

// const borrarImagen= async(UsuarioID,folder)=>{
//     const imagenDB= await Imagen.find({usuario:UsuarioID});

//     for (let i = 0; i < imagenDB.length; i++) {
//         let pathImg='./files/'+folder+'/'+imagenDB[i].img
//         if(fs.existsSync(pathImg)) fs.unlinkSync(pathImg);
//         await Imagen.findByIdAndDelete(imagenDB[i]._id);
//     }

//     return true;
// }

module.exports={subirImagen, borrarImagen };