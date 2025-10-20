const { response }=require('express');
const bcrypt=require('bcryptjs');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const Prestador = require('../models/prestador');
const { checkCUIT, timeNow } = require('../helpers/commons');
const { v4: uuidv4 }=require('uuid');
const { subirImagen, borrarImagen, subirOrdenRetiro } = require('../helpers/imagenes');
const { generarJWT } = require('../helpers/jwt');
const { notificar } = require('./mail');
const Imagen = require('../models/imagen');
const Pedido = require('../models/pedido');
const PedidoOferta = require('../models/pedidoOferta');
const Orden = require('../models/orden');
const fs=require('fs/promises');
const path=require('path');
const { PDFDocument }= require('pdf-lib');
const { createHash }= require('crypto');

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
        usuario.TokenID=0;

        if(Tipo=='0'){
            const cliente= new Cliente(req.body);
            cliente.UUID=usuario.UUID;
            
            await cliente.save();
        }else{
            const prestador= new Prestador(req.body);
            prestador.UUID=usuario.UUID;
            
            for (let i = 0; i < req.files['img'].length; i++) {
                await subirImagen(req.files['img'][i], usuario.UUID, 1, res, 'vehiculo');
            }

            await subirImagen(req.files['imgFrente'], usuario.UUID, 0, res, 'frente');
            await subirImagen(req.files['imgDorso'], usuario.UUID, 0, res, 'dorso');

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
            campos._doc.TokenID+=1;
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
            tipo=usuarioDB.Tipo
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
            tipo,
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
    if(!usuarioDB){
        res.json({
            ok:false
        })
        return;
    }else{        
        const {...campos}=usuarioDB;
        campos._doc.UltimaConexion=timeNow();
        campos._doc.TokenID+=1;
        await Usuario.findByIdAndUpdate(usuarioDB.id, campos,{new:true});  

        const token= await generarJWT(id, usuarioDB.EmailResponsable, 'renew', req.remember);
        res.json({
            ok:true,
            token,
            nombre: usuarioDB.Empresa,
            mail: usuarioDB.EmailResponsable,
            tipo: usuarioDB.Tipo,
            UUID: usuarioDB.UUID,
            id
        })
    }
}

const forgotPassword= async(req,res=response)=>{
    const usuarioDB= await Usuario.find({EmailResponsable: req.body.email})
    
    if(!usuarioDB[0]){        
        res.json({
            ok:false
        })
        return;
    }else{
        const {EmailResponsable, id}=usuarioDB[0];
        
        notificar(EmailResponsable, id, 'password')
    
        res.json({
            ok:true,
        })
    }
}

const changePassword= async(req,res=response)=>{
    const id=req.id;
    const usuarioDB= await Usuario.findById(id)
    
    if(!usuarioDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const {Contrasena, ...campos}=usuarioDB;
        
        const salt=bcrypt.genSaltSync();
        campos._doc.TokenID+=1;
        campos._doc.Contrasena=bcrypt.hashSync(req.body.password,salt);
        await Usuario.findByIdAndUpdate(id, campos,{new:true});

        res.json({
            ok:true,
        })
    }
}

const getUserData= async(req,res=response)=>{
    const id=req.id;
    const usuarioDB= await Usuario.findById(id, {Habilitado:0, Validado:0, __v:0, TokenID:0, UltimaConexion:0, Contrasena:0})
    if(!usuarioDB){
        res.json({
            ok:false
        })
        return;
    }else{
        let datoDB, imgs;
        
        if(usuarioDB.Tipo=='0') datoDB= await Cliente.findOne({UUID: usuarioDB.UUID}, {UUID:0, _id:0, __v:0});
        if(usuarioDB.Tipo=='1') {
            datoDB= await Prestador.findOne({UUID: usuarioDB.UUID}, {UUID:0, _id:0, __v:0});
            imgs= await Imagen.find({usuario: usuarioDB.UUID}, {usuario:0, _id:0, __v:0});
        }

        res.json({
            ok:true,
            usuarioDB,
            datoDB,
            imgs
        })
    }
}

const changeData= async(req,res=response)=>{
    const id=req.id;
    const usuarioDB= await Usuario.findById(id)
    
    if(!usuarioDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const {...campos}=usuarioDB;
        campos._doc = changeCampos(campos._doc, req.files['userPayload'].data, res);

        await Usuario.findByIdAndUpdate(id, campos,{new:true});

        if(usuarioDB.Tipo=='0'){
            const clienteDB= await Cliente.findOne({UUID: usuarioDB.UUID})
            const {...campos}=clienteDB;
            campos._doc = changeCampos(campos._doc, req.files['datoPayload'].data, res);
            
            await Cliente.findByIdAndUpdate(clienteDB.id, campos,{new:true});
        }else{
            const prestadorDB= await Prestador.findOne({UUID: usuarioDB.UUID})
            const {...campos}=prestadorDB;
            campos._doc = changeCampos(campos._doc, req.files['datoPayload'].data, res);

            await Prestador.findByIdAndUpdate(prestadorDB.id, campos,{new:true});

            if(req.files['img']){
                await borrarImagen(usuarioDB.UUID,'vehiculo','vehiculo')
                for (let i = 0; i < req.files['img'].length; i++) {
                    await subirImagen(req.files['img'][i], usuarioDB.UUID, 1, res, 'vehiculo');
                }
            }

            if(req.files['imgFrente']){
                await borrarImagen(usuarioDB.UUID,'carnet','frente')
                await subirImagen(req.files['imgFrente'], usuarioDB.UUID, 0, res, 'frente');
            }
            if(req.files['imgDorso']) {
                await borrarImagen(usuarioDB.UUID,'carnet','dorso')
                await subirImagen(req.files['imgDorso'], usuarioDB.UUID, 0, res, 'dorso');
            }
        }

        res.json({
            ok:true,
        })
    }
}

const changeCampos= (campos, buffer, res)=>{
    const jsonString = buffer.toString('utf8');
    const data = JSON.parse(jsonString);

    if(data['CUIT']){
        const flag=checkCUIT(data['CUIT']);
        if(!flag){
            return res.status(400).json({
                ok:false,
                msg:'CUIT invalido'
            });
        }
    }

    if(data['EmailResponsable'] || data['_id'] || data['UUID'] || data['UltimaConexion'] || data['TokenID'] || data['Tipo'] || data['Validado']){        
        return res.status(400).json({
            ok:false,
            msg:'Error'
        });
    }

    for (const key in data) {
        campos[key]=data[key];
    }

    return campos;
}

const mensaje= async(req,res=response)=>{
    
    notificar(process.env.CONTACTO1+'@'+process.env.CONTACTO2, req.body, 'contacto')

    res.json({
        ok:true,
    })
}

const verPedido= async(req,res = response) =>{
    try {
        let pedido = await Pedido.findOne({UUID: req.body.id})
        if(!pedido || !pedido.admin){
            res.json({
                ok:false
            })
            return;
        }

        let ordenDB = await Orden.findOne({pdf: pedido.ordenRetiro}, {prestador:0, __v:0, usuario:0})

        res.json({
            ok:true,
            pedido,
            ordenDB
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const getOfertaPedido= async(req,res = response) =>{
    try {
        const oferta = await PedidoOferta.find({UUID_Pedido: req.body.pedido})
        
        res.json({
            ok:true,
            oferta,
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const subirOrden= async(req,res = response) =>{    
    try {
        const pedidoDB = await Pedido.findOne({ UUID: req.body.pedido})  
        if(pedidoDB.ordenRetiro!=''){
            res.json({
                ok:false,
                msg:'Ocurrió un error'
            })
            return;
        }   

        const orden=req.files['orden'];
        const nombreCortado=orden.name.split('.');
        const extensionArchivo=nombreCortado[nombreCortado.length-1];
        const nombreArchivo= uuidv4()+'.'+extensionArchivo;
        await subirOrdenRetiro(req.files['orden'], pedidoDB.Cliente, pedidoDB.Cliente, res, nombreCortado,nombreArchivo);

        const {...campos}=pedidoDB;
        campos._doc.ordenRetiro = nombreArchivo;        

        await Pedido.findByIdAndUpdate(pedidoDB.id, campos,{new:true});

        res.json({
            ok:true,
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const getOfertas= async(req,res = response) =>{
    try {
        const pedidoDB = await Pedido.findById(req.body._id)
        if(!pedidoDB){
            res.json({
                ok:false
            })
            return;
        }

        const ofertasDB = await PedidoOferta.aggregate([
            { '$match': { UUID_Pedido: pedidoDB.UUID } },
            { $lookup: {
                from: "usuarios",
                localField: "prestador",
                foreignField: "UUID",
                as: "dato_prestador"
            } },
            {$unwind: { path: "$dato_prestador", preserveNullAndEmptyArrays: true }},
            { $project: {
                __v: 0,
                "dato_prestador.__v": 0, "dato_prestador.CondicionFiscal": 0, "dato_prestador.Contrasena": 0, "dato_prestador.Habilitado": 0, "dato_prestador.Validado": 0,
                "dato_prestador._id": 0, "dato_prestador.Tipo": 0, "dato_prestador.TokenID": 0, "dato_prestador.UUID": 0, "dato_prestador.UltimaConexion": 0,
                "dato_prestador.Apellido": 0, "dato_prestador.Nombre": 0, "dato_prestador.CUIT": 0,
            } },
        ]).collation({locale: 'en'});

        
        res.json({
            ok:true,
            ofertasDB,
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const firmar= async(req,res = response) =>{
    try {
        const {pedido, firma}=req.body;

        const pedidoDB = await Pedido.findOne({UUID: pedido})
        if(!pedidoDB){
            res.json({
                ok:false,
                msg:'Ocurrió un error'
            })
            return;
        }
        const ordenDB = await Orden.findOne({pdf: pedidoDB.ordenRetiro})
        if(!ordenDB){
            res.json({
                ok:false,
                msg:'Ocurrió un error'
            })
            return;
        }

        const originalPdfBytes = await fs.readFile(path.join( __dirname, '../files/orden/'+'Original-'+ordenDB.pdf));

        const signatureBytes = Buffer.from(firma.split(',')[1], 'base64');

        const pdf = await PDFDocument.load(originalPdfBytes, { updateMetadata: true });
        const pages = pdf.getPages();
        const page = pages[pages.length - 1];
        const { width } = page.getSize();

        const png = await pdf.embedPng(signatureBytes);
        const sigW = 220, sigH = (png.height / png.width) * sigW;
        const x = width - sigW - 48;
        const y = 72;

        pages[0].drawImage(png, { x:350, y: 500, width: sigW, height: sigH });
        pages[0].drawImage(png, { x:350, y: 150, width: sigW, height: sigH });
        pages[1].drawImage(png, { x:350, y: 415, width: sigW, height: sigH });
        //page.drawImage(png, { x, y, width: sigW, height: sigH });

        const ts = new Date().toISOString();

        const signedBytes = await pdf.save();
        const sha256 = createHash('sha256').update(signedBytes).digest('hex');

        let userID=req.id
        await fs.writeFile(path.join( __dirname, '../files/orden/'+ordenDB.pdf), signedBytes, { sha256, userID, ts, ua: req.headers['user-agent'], ip: req.ip });
        
        const {...campos}=ordenDB;
        campos._doc.firma = { sha256, userID, ts, ua: req.headers['user-agent'], ip: req.ip, fecha: timeNow() };

        await Orden.findByIdAndUpdate(ordenDB.id, campos,{new:true});

        res.json({
            ok:true,
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

module.exports={ crearUsuario, validarCuenta, reValidarCuenta, login, renewToken, forgotPassword, changePassword, getUserData, changeData, mensaje, verPedido, getOfertaPedido, subirOrden, getOfertas, firmar }