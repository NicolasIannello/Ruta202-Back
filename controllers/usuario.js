const { response }=require('express');
const bcrypt=require('bcryptjs');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const Prestador = require('../models/prestador');
const { checkCUIT, timeNow } = require('../helpers/commons');
const { v4: uuidv4 }=require('uuid');
const { subirImagen } = require('../helpers/imagenes');

const crearUsuario= async(req,res = response) =>{
    const {EmailResponsable, Contrasena, CUIT, Tipo}=req.body;

    try {
        const flag=checkCUIT(CUIT);
        if(!flag){
            return res.status(400).json({
                ok:false,
                msg:'CUIT invalido'
            });
        }
        const existeEmail= await Usuario.findOne({EmailResponsable});
        if(existeEmail){
            return res.status(400).json({
                ok:false,
                msg:'Ya existe una cuenta con ese Email'
            });
        }
        
        const usuario= new Usuario(req.body);

        const salt=bcrypt.genSaltSync();
        usuario.Contrasena=bcrypt.hashSync(Contrasena,salt);
        usuario.Habilitado=false;
        usuario.Validado=false; 
        usuario.UltimaConexion=timeNow();
        usuario.UUID=uuidv4();

        if(Tipo=='0'){
            const cliente= new Cliente(req.body);
            cliente.UUID=usuario.UUID;
            
            await cliente.save();
        }else{
            const prestador= new Prestador(req.body);
            prestador.UUID=usuario.UUID;
            
            for (let i = 0; i < req.files['img'].length; i++) {
                subirImagen(req.files['img'][i], usuario.UUID, 1, res);
            }

            subirImagen(req.files['imgFrente'], usuario.UUID, 0, res);
            subirImagen(req.files['imgDorso'], usuario.UUID, 0, res);

            await prestador.save();
        }

        await usuario.save();

        // const token= await generarJWT(usuario._id,1);
        // notificar(usuario.mail,usuario._id,2)

        res.json({
            ok:true,
            EmailResponsable,
            //token
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

module.exports={ crearUsuario }