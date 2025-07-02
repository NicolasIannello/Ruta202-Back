const { response }=require('express');
const bcrypt=require('bcryptjs');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const Prestador = require('../models/prestador');
const { checkCUIT, timeNow } = require('../helpers/commons');
const { v4: uuidv4 }=require('uuid');
const { subirImagen } = require('../helpers/imagenes');
const { generarJWT } = require('../helpers/jwt');
const { notificar } = require('./mail');

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

        const token= await generarJWT(usuario._id, EmailResponsable, 'renew');
        notificar(EmailResponsable, usuario._id, 'validacion')

        res.json({
            ok:true,
            EmailResponsable,
            token
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const validarCuenta= async(req,res=response)=>{
    const id=req.id;
    const usuarioDB= await Usuario.findById(id)
    
    if(!usuarioDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const {Validado, ...campos}=usuarioDB;
        
        if(!Validado){
            campos._doc.Validado=true;
            await Usuario.findByIdAndUpdate(id, campos,{new:true});
        }

        res.json({
            ok:true,
            mail:req.mail
        })
    }
}

const reValidarCuenta= async(req,res=response)=>{
    const usuarioDB= await Usuario.find({EmailResponsable: req.body.email})
    
    if(!usuarioDB[0]){        
        res.json({
            ok:false
        })
        return;
    }else{
        const {Validado, EmailResponsable, id}=usuarioDB[0];
        
        if(!Validado){
            notificar(EmailResponsable, id, 'validacion')
        }else{
            return res.json({
                ok:false,
            })
        }

    
        res.json({
            ok:true,
        })
    }
}

const login=async(req,res=response)=>{
    const { email, password, rememberMe }= req.body;

    try {        
        const usuarioDB= await Usuario.findOne({EmailResponsable: email});    
        if(!usuarioDB){
            return res.json({
                ok:false,
                msg:'Datos incorrectos'
            })
        }
        
        const validPassword=bcrypt.compareSync(password,usuarioDB.Contrasena);
        if(!validPassword){
            return res.json({
                ok:false,
                msg:'Datos incorrectos'
            })
        }

        const {...campos}=usuarioDB;
        campos._doc.UltimaConexion=timeNow();
        await Usuario.findByIdAndUpdate(usuarioDB.id, campos,{new:true});

        validado=usuarioDB.Validado;
        habilitado=usuarioDB.Habilitado;
        token='';
        nombre='';
        mail='';
        id='';
        if(validado && habilitado){
            token= await generarJWT(usuarioDB.id, usuarioDB.EmailResponsable, 'renew', rememberMe);
            nombre=usuarioDB.Empresa;
            mail=usuarioDB.EmailResponsable;
            id=usuarioDB.id
        }else if(!validado){
            notificar(usuarioDB.EmailResponsable, usuarioDB.id, 'validacion')
        }

        res.json({
            ok:true,
            validado,
            habilitado,
            token,
            nombre,
            mail,
            id
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error login'
        });
    }
}

const renewToken= async(req,res=response)=>{    
    const id=req.id;
    const usuarioDB= await Usuario.findById(id)
    const token= await generarJWT(id, usuarioDB.EmailResponsable, 'renew', req.remember);    
    if(!usuarioDB){
        res.json({
            ok:false
        })
        return;
    }else{        
        const {...campos}=usuarioDB;
        campos._doc.UltimaConexion=timeNow();
        await Usuario.findByIdAndUpdate(usuarioDB.id, campos,{new:true});  

        res.json({
            ok:true,
            token,
            nombre: usuarioDB.Empresa,
            mail: usuarioDB.EmailResponsable,
            id
        })
    }
}

module.exports={ crearUsuario, validarCuenta, reValidarCuenta, login, renewToken }