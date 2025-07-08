const { response }=require('express');
const bcrypt=require('bcryptjs');
const { generarJWTAdmin } = require('../helpers/jwt');
const Admin = require('../models/admin');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const Prestador = require('../models/prestador');
const Imagen = require('../models/imagen');

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
        const limit= parseInt(req.body.limit) || 20;
        const orden= parseInt(req.body.orden) || 1;
        const order= req.body.order || '_id';
        var sortOperator = { "$sort": { } };
        sortOperator["$sort"][order] = orden;

        const [ users, total ]= await Promise.all([
            Usuario.aggregate([
                { $project: { "Contrasena": 0, __v: 0,  "TokenID": 0 } },
                sortOperator,
                { $skip: desde },
                { $limit: limit },
            ]).collation({locale: 'en'}),
            Usuario.countDocuments()
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

module.exports={ login, renewToken, inicioData, getUsers, getUserExtra }