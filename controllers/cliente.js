const { response }=require('express');
const Pedido = require('../models/pedido');
const { v4: uuidv4 }=require('uuid');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');

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
        pedido.prestador=''

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


module.exports={ crearPedido }