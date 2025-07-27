const { response }=require('express');
const Pedido = require('../models/pedido');
const { v4: uuidv4 }=require('uuid');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const PedidoOferta = require('../models/pedidoOferta');

const crearPedido= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false
            })
            return;
        }
        const clienteDB = await Cliente.find({UUID: usuarioDB.UUID})
        if(!clienteDB){
            res.json({
                ok:false
            })
            return;
        }
        
        const pedido= new Pedido(req.body.pedido);
        pedido.UUID=uuidv4();
        pedido.Cliente=usuarioDB.UUID
        pedido.disponible=true
        pedido.oferta=''
        pedido.estado='Creado'

        await pedido.save();

        res.json({
            ok:true,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const getPedidos= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false
            })
            return;
        }
        const clienteDB = await Cliente.find({UUID: usuarioDB.UUID})
        if(!clienteDB){
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
                { '$match': { Cliente: usuarioDB.UUID } },
                regExOperator,
                { $project: { "Cliente": 0, __v: 0 } },
                sortOperator,
                { $skip: desde },
                { $limit: limit },
            ]).collation({locale: 'en'}),
            Pedido.countDocuments({ ...regExOperator['$match'], Cliente: usuarioDB.UUID }).collation({ locale: 'en' })
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

const getOfertas= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false
            })
            return;
        }
        const pedidoDB = await Pedido.findById(req.body._id)
        if(!pedidoDB || pedidoDB.Cliente!=usuarioDB.UUID){
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

const borrarOferta= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false,
                msg:'Ocurrió un error'
            })
            return;
        }
        const pedidoOfertaDB = await PedidoOferta.findById(req.body._id)
        if(!pedidoOfertaDB){
            res.json({
                ok:false,
                msg:'Ocurrió un error'
            })
            return;
        }
        const pedidoDB = await Pedido.find({UUID: pedidoOfertaDB.UUID_Pedido})
        if(!pedidoDB[0] || pedidoDB[0].Cliente!=usuarioDB.UUID || !pedidoDB[0].disponible){
            res.json({
                ok:false,
                msg:'No se pudo eliminar la oferta'
            })
            return;
        }

        await PedidoOferta.findByIdAndDelete(req.body._id)

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

const aceptarOferta= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false,
                msg:'Ocurrió un error'
            })
            return;
        }
        const pedidoOfertaDB = await PedidoOferta.findById(req.body._id)
        if(!pedidoOfertaDB){
            res.json({
                ok:false,
                msg:'Ocurrió un error'
            })
            return;
        }
        const pedidoDB = await Pedido.find({UUID: pedidoOfertaDB.UUID_Pedido})
        if(!pedidoDB[0] || pedidoDB[0].Cliente!=usuarioDB.UUID || !pedidoDB[0].disponible){
            res.json({
                ok:false,
                msg:'No se pudo aceptar la oferta'
            })
            return;
        }

        const {...campos}=pedidoDB[0];
        campos._doc.disponible = false;
        campos._doc.oferta = pedidoOfertaDB.UUID;
        campos._doc.estado = 'En proceso'

        await Pedido.findByIdAndUpdate(pedidoDB[0].id, campos,{new:true});
        await PedidoOferta.deleteMany({ 'UUID_Pedido': { $eq: pedidoDB[0].UUID}, 'UUID': { $ne: pedidoOfertaDB.UUID } })

        const {...campos2}=pedidoOfertaDB;
        campos2._doc.estado = 'Aceptada'

        await PedidoOferta.findByIdAndUpdate(pedidoOfertaDB.id, campos2,{new:true});

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

const geocode= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false
            })
            return;
        }
        const clienteDB = await Cliente.find({UUID: usuarioDB.UUID})
        if(!clienteDB){
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

const geocodeReverse= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false
            })
            return;
        }
        const clienteDB = await Cliente.find({UUID: usuarioDB.UUID})
        if(!clienteDB){
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

module.exports={ crearPedido, getPedidos, getOfertas, borrarOferta, aceptarOferta, geocode, geocodeReverse }