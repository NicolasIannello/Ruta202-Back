const { response }=require('express');
const bcrypt=require('bcryptjs');
const { generarJWTAdmin } = require('../helpers/jwt');
const Admin = require('../models/admin');

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

module.exports={ login, renewToken }