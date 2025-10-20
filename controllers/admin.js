const { response }=require('express');
const bcrypt=require('bcryptjs');
const { generarJWTAdmin } = require('../helpers/jwt');
const Admin = require('../models/admin');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const Prestador = require('../models/prestador');
const Imagen = require('../models/imagen');
const { subirImagen, borrarImagen } = require('../helpers/imagenes');
const PedidoOferta = require('../models/pedidoOferta');
const Pedido = require('../models/pedido');
const { v4: uuidv4 }=require('uuid');
const { notificar } = require('./mail');

const login=async(req,res=response)=>{
    const { admin, password }= req.body;

    try {        
        const adminDB= await Admin.findOne({Usuario: admin});    
        if(!adminDB){
            return res.json({
                ok:false,
                msg:'Datos incorrectos'
            })
        }
        
        const validPassword=bcrypt.compareSync(password,adminDB.Contrasena);
        if(!validPassword){
            return res.json({
                ok:false,
                msg:'Datos incorrectos'
            })
        }

        token= await generarJWTAdmin(adminDB.id);

        res.json({
            ok:true,
            token,
            nombre: adminDB.Usuario,
            id: adminDB.id
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
    const adminDB= await Admin.findById(id)
    if(!adminDB){
        res.json({
            ok:false
        })
        return;
    }else{        
        const {...campos}=adminDB;
        campos._doc.TokenID+=1;
        await Admin.findByIdAndUpdate(adminDB.id, campos,{new:true});  

        const token= await generarJWTAdmin(id);
        res.json({
            ok:true,
            token,
            nombre: adminDB.Usuario,
            id
        })
    }
}

const inicioData= async(req,res=response)=>{    
    const id=req.id;
    const adminDB= await Admin.findById(id)
    if(!adminDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const [stats] = await Usuario.aggregate([
            {$group: {
                _id: null,
                totalUsers: { $sum: { $cond: [{ $eq: ['$Tipo', '0'] }, 1, 0] } },
                totalUsersV: { $sum: { $cond: [{ $and: [{ $eq: ['$Tipo', '0'] }, { $eq: ['$Validado', true]}, { $eq: ['$Habilitado', true]} ]}, 1, 0] } },
                //totalUsersH: { $sum: { $cond: [{ $and: [{ $eq: ['$Tipo', '0'] },{ $eq: ['$Habilitado', true]} ]}, 1, 0] } },
                totalPrestadores: { $sum: { $cond: [{ $eq: ['$Tipo', '1'] }, 1, 0] } },
                totalPrestadoresV: { $sum: { $cond: [{ $and: [{ $eq: ['$Tipo', '1'] }, { $eq: ['$Validado', true]}, { $eq: ['$Habilitado', true]} ]}, 1, 0] } },
                //totalPrestadoresH: { $sum: { $cond: [{ $and: [{ $eq: ['$Tipo', '1'] },{ $eq: ['$Habilitado', true]} ]}, 1, 0] } },
            }}
        ]);        

        res.json({
            ok:true,
            stats
        })
    }
}

const getUsers= async(req,res=response)=>{    
    const id=req.id;
    const adminDB= await Admin.findById(id)
    if(!adminDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const desde= parseInt(req.body.desde) || 0;
        const limit= parseInt(req.body.limit) || 10;
        const orden= parseInt(req.body.orden) || 1;
        const order= req.body.order || '_id';
        var sortOperator = { "$sort": { } };
        sortOperator["$sort"][order] = orden;
        const tipo= req.body.datoTipo || '_id';
        const dato= req.body.datoBuscar ? true : false;
        var regExOperator = { "$match": { } };
        if(dato && dato!=''){
            if (req.body.datoBuscar=='true' || req.body.datoBuscar=='false'){
                regExOperator['$match'][tipo] = req.body.datoBuscar=='true' ? true : false;
            }else{
                regExOperator["$match"][tipo] = { "$regex": { }, "$options": "i" };
                regExOperator["$match"][tipo]["$regex"] = req.body.datoBuscar;
            }
        }else{
            regExOperator['$match'][tipo] = { $exists: true }
        }
                
        const [ users, total ]= await Promise.all([
            Usuario.aggregate([
                regExOperator,
                { $project: { "Contrasena": 0, __v: 0,  "TokenID": 0 } },
                sortOperator,
                { $skip: desde },
                { $limit: limit },
            ]).collation({locale: 'en'}),
            Usuario.countDocuments(regExOperator['$match']).collation({ locale: 'en' })
        ]);
        
        res.json({
            ok:true,
            users,
            total
        })
    }
}

const getUserExtra= async(req,res=response)=>{    
    const id=req.id;
    const adminDB= await Admin.findById(id)
    if(!adminDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const { Tipo, UUID } = req.body
        let datoDB, imgs;
                
        if(Tipo=='0') datoDB= await Cliente.findOne({UUID:UUID}, {UUID:0, __v:0});
        if(Tipo=='1') {
            datoDB= await Prestador.findOne({UUID:UUID}, {UUID:0, __v:0});
            imgs= await Imagen.find({usuario: UUID}, {usuario:0, __v:0});
        }
        
        res.json({
            ok:true,
            datoDB,
            imgs
        })
    }
}

const changeData= async(req,res=response)=>{
    const id=req.id;
    const adminDB= await Admin.findById(id)
    
    if(!adminDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const usuarioDB= await Usuario.findOne({UUID:req.body.UUID})
        const {...campos}=usuarioDB;
        campos._doc = changeCampos(campos._doc, req.files['userPayload'].data, res);

        await Usuario.findByIdAndUpdate(usuarioDB._id, campos,{new:true});

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
            msg:'Error campos'
        });
    }

    for (const key in data) {
        campos[key]=data[key];
    }

    return campos;
}

const borrarUser= async(req,res=response)=>{
    const id=req.id;
    const adminDB= await Admin.findById(id)
    
    if(!adminDB){
        res.json({
            ok:false
        })
        return;
    }else{
        const usuarioDB= await Usuario.findById(req.body.id)

        if(usuarioDB.Tipo=='0'){
            await Cliente.deleteOne({UUID: usuarioDB.UUID})
        }else{
            await Prestador.deleteOne({UUID: usuarioDB.UUID})
            await borrarImagen(usuarioDB.UUID,'vehiculo','vehiculo')
            await borrarImagen(usuarioDB.UUID,'carnet','frente')
            await borrarImagen(usuarioDB.UUID,'carnet','dorso')                
        }
        await Usuario.findByIdAndDelete(req.body.id)

        res.json({
            ok:true,
        })
    }
}

const crearPedidoAdmin= async(req,res=response)=>{    
    try {
        const id=req.id;
        const adminDB= await Admin.findById(id)
        if(!adminDB){
            res.json({
                ok:false
            })
            return;
        }
        
        const pedido= new Pedido(req.body.pedido);
        pedido.UUID=uuidv4();
        pedido.Cliente=adminDB.Usuario
        pedido.disponible=false
        pedido.oferta=''
        pedido.estado='En proceso'
        pedido.selloPrestador=false
        pedido.selloCliente=false
        pedido.ordenRetiro=''
        pedido.admin=true;

        const pedidoOferta = await new PedidoOferta(req.body)
        pedidoOferta.prestador= adminDB.Usuario 
        pedidoOferta.UUID_Pedido= pedido.UUID
        pedidoOferta.UUID= uuidv4()
        pedidoOferta.estado='Aceptada'

        await pedidoOferta.save()
        await pedido.save();

        let dato={pedido:pedido, oferta:pedidoOferta}
        notificar(process.env.CONTACTO1+'@'+process.env.CONTACTO2, '', 'pedidoAdmin', dato)

        res.json({
            ok:true,
            pedido: pedido.UUID
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
}

const verPedidosAdmin= async(req,res = response) =>{
    try {
        const id=req.id;
        const adminDB= await Admin.findById(id)
        if(!adminDB){
            res.json({
                ok:false
            })
            return;
        }

        const desde= parseInt(req.body.desde) || 0;
        const limit= parseInt(req.body.limit) || 10;
        const orden= parseInt(req.body.orden) || 1;
        const order= req.body.order || '_id';
        var sortOperator = { "$sort": { } };
        sortOperator["$sort"][order] = orden;
        const tipo= req.body.datoTipo || '_id';
        const dato= req.body.datoBuscar ? true : false;
        var regExOperator = { "$match": { } };
        if(dato && dato!=''){
            if (req.body.datoBuscar=='true' || req.body.datoBuscar=='false'){
                regExOperator['$match'][tipo] = req.body.datoBuscar=='true' ? true : false;
            }else{
                regExOperator["$match"][tipo] = { "$regex": { }, "$options": "i" };
                regExOperator["$match"][tipo]["$regex"] = req.body.datoBuscar;
            }
        }else{
            regExOperator['$match'][tipo] = { $exists: true }
        }
                
        const [ pedidos, total ]= await Promise.all([
            Pedido.aggregate([
                { '$match': { admin: true } },
                regExOperator,
                { $project: { "Cliente": 0, __v: 0,"prestador":0 } },
                sortOperator,
                { $skip: desde },
                { $limit: limit },
            ]).collation({locale: 'en'}),
            Pedido.countDocuments({ ...regExOperator['$match'], admin: true }).collation({ locale: 'en' })
        ]);
        
        res.json({
            ok:true,
            pedidos,
            total
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const getOfertaPedidoAdmin= async(req,res = response) =>{
    try {
        const id=req.id;
        const adminDB= await Admin.findById(id)
        if(!adminDB){
            res.json({
                ok:false
            })
            return;
        }

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

const verPedidoAdmin= async(req,res = response) =>{
    try {
        const id=req.id;
        const adminDB= await Admin.findById(id)
        if(!adminDB){
            res.json({
                ok:false
            })
            return;
        }
        let pedido = await Pedido.findOne({UUID: req.body.id})

        res.json({
            ok:true,
            pedido,
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const geocodeAdmin= async(req,res = response) =>{
    try {        
        const id=req.id;
        const adminDB= await Admin.findById(id)
        if(!adminDB){
            res.json({
                ok:false
            })
            return;
        }
        
        const address = encodeURIComponent(req.body.lugar || '');
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GEOCODE}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            //res.json(data);
            res.json({
                ok:true,
                data
            });
        } catch (err) {
            res.status(500).json({
                ok:false, 
                error: err.toString() 
            });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const geocodeReverseAdmin= async(req,res = response) =>{
    try {        
        const id=req.id;
        const adminDB= await Admin.findById(id)
        if(!adminDB){
            res.json({
                ok:false
            })
            return;
        }
        
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${req.body.lat},${req.body.lng}&key=${process.env.GEOCODE}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            res.json({
                ok:true,
                data
            });
        } catch (err) {
            res.status(500).json({
                ok:false,
                error: err.toString()
            });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

module.exports={ login, renewToken, inicioData, getUsers, getUserExtra, changeData, borrarUser, crearPedidoAdmin, verPedidosAdmin, getOfertaPedidoAdmin, verPedidoAdmin, geocodeAdmin, geocodeReverseAdmin }