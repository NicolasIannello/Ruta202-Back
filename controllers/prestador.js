const { response }=require('express');
const Pedido = require('../models/pedido');
const Usuario = require('../models/usuario');
const Prestador = require('../models/prestador');
const PedidoOferta = require('../models/pedidoOferta');
const { v4: uuidv4 }=require('uuid');

const verPedidos= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false
            })
            return;
        }
        const prestadorDB = await Prestador.find({UUID: usuarioDB.UUID})
        if(!prestadorDB){
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
                { '$match': { disponible: true } },
                regExOperator,
                { $project: { "Cliente": 0, __v: 0,"UUID": 0,"prestador":0,"disponible":0 } },
                sortOperator,
                { $skip: desde },
                { $limit: limit },
            ]).collation({locale: 'en'}),
            Pedido.countDocuments({ ...regExOperator['$match'], disponible: true }).collation({ locale: 'en' })
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

const ofertaPedido= async(req,res = response) =>{
    try {
        const usuarioDB = await Usuario.findById(req.id)
        if(!usuarioDB){
            res.json({
                ok:false
            })
            return;
        }
        const prestadorDB = await Prestador.find({UUID: usuarioDB.UUID})
        if(!prestadorDB){
            res.json({
                ok:false
            })
            return;
        }
        const pedidoDB = await Pedido.findById(req.body._id)
        if(!pedidoDB || !pedidoDB.disponible){
            res.json({
                ok:false,
                msg:'El pedido yo no se encuentra disponible'
            })
            return;
        }
        const pedidoOFertaDB = await PedidoOferta.find({ prestador: usuarioDB.UUID, UUID_Pedido: pedidoDB.UUID })
        if(pedidoOFertaDB[0]){
            res.json({
                ok:false,
                msg:'Ya ha realizado una oferta para este pedido'
            })
            return;
        }
        
        const pedidoOferta = await new PedidoOferta({prestador: usuarioDB.UUID, UUID_Pedido: pedidoDB.UUID, oferta: req.body.oferta, UUID: uuidv4()})

        await pedidoOferta.save()
        
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

module.exports={ verPedidos, ofertaPedido }