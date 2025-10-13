const Imagen = require('../models/imagen');
const Orden = require('../models/orden');
const { v4: uuidv4 }=require('uuid');
const fs=require('fs');
const path=require('path');
const Usuario = require('../models/usuario');
const Admin = require('../models/admin');

const subirImagen= async(imagen,UsuarioID,id,res,tipo)=>{
    const img=imagen;
    const nombreCortado=img.name.split('.');
    const extensionArchivo=nombreCortado[nombreCortado.length-1];
    const nombreArchivo= uuidv4()+'.'+extensionArchivo;
    let path;
    let datos;
    if(id==1){
        path= './files/vehiculo/'+nombreArchivo;
        datos={ usuario: UsuarioID, img: nombreArchivo, tipo:tipo };
    }else{
        path= './files/carnet/'+nombreArchivo;
        datos={ usuario: UsuarioID, img: nombreArchivo, tipo:tipo };
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

const borrarImagen= async(UsuarioID,folder,tipo)=>{
    const imagenDB= await Imagen.find({usuario:UsuarioID, tipo:tipo});

    for (let i = 0; i < imagenDB.length; i++) {
        let pathImg='./files/'+folder+'/'+imagenDB[i].img
        if(fs.existsSync(pathImg)) fs.unlinkSync(pathImg);        
        await Imagen.findByIdAndDelete(imagenDB[i]._id);
    }

    return true;
}

const getImg= async(req,res = response) =>{
    const { img }= req.query
    const imgDB = await Imagen.findOne({img: img},{_id:0, __v:0})
    
    let usuarioDB
    if(req.id){
        usuarioDB = await Usuario.findById(req.id)
        let flag=true;
        if(!usuarioDB){
            adminDB = await Admin.findById(req.id)
            if(adminDB) flag=false;
        }
        if(flag && usuarioDB.UUID!=imgDB.usuario){
            return res.status(500).json({
                ok:false,
                msg:'error en verificacion',
            })
        }
    }

    let pathImg;
    if(imgDB.tipo=='vehiculo'){
        pathImg=pathImg= path.join( __dirname, '../files/vehiculo/'+imgDB.img);
    }else if(req.id){
        pathImg=pathImg= path.join( __dirname, '../files/carnet/'+imgDB.img);
    }

    if(fs.existsSync(pathImg)){
        res.sendFile(pathImg);
    }else{
        pathImg= path.join( __dirname, '../files/no-img.jpg');
        res.sendFile(pathImg);
    }
};

const subirOrdenRetiro= async(orden,prestadorID,UsuarioID,ip,res,nombreCortado,nombreArchivo)=>{    
    let path= './files/orden/'+nombreArchivo;
    let datos={ prestador: prestadorID, usuario: UsuarioID, pdf: nombreArchivo, time: '', firma: false, ip: '', };

    orden.mv(path, async (err)=>{
        if(err){
            console.log(err);
            return res.status(500).json({
                ok:false,
                msg:'error en carga de orden de retiro '+nombreCortado[0],
            })
        }
        const ordenRetiro = new Orden(datos);
        await ordenRetiro.save();
        
        return true;
    })
}

const getOrden= async(req,res = response) =>{
    const { orden }= req.query
    const ordenDB = await Orden.findOne({pdf: orden},{_id:0, __v:0})
        
    let usuarioDB
    if(req.id){
        usuarioDB = await Usuario.findById(req.id)
        let flag=true;
        if(!usuarioDB){
            adminDB = await Admin.findById(req.id)
            if(adminDB) flag=false;
        }
        if(flag && usuarioDB.UUID!=ordenDB.usuario && usuarioDB.UUID!=ordenDB.prestador){
            return res.status(500).json({
                ok:false,
                msg:'error en verificacion',
            })
        }
    }

    let pathOrden= path.join( __dirname, '../files/orden/'+ordenDB.pdf);
    
    if(fs.existsSync(pathOrden)){
        res.sendFile(pathOrden);
    }else{
        pathOrden= path.join( __dirname, '../files/no-img.jpg');
        res.sendFile(pathOrden);
    }
};

module.exports={ subirImagen, getImg, borrarImagen, subirOrdenRetiro, getOrden };