const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");
const Admin = require("../models/admin");

const validarJWT= async (req,res,next)=>{
    const { token, tipo }=req.body || req.query
    
    if(!token){
        return res.status(401).json({
            ok:false,
            msg:'no hay token'
        });
    }

    try {        
        let secret;
        switch (tipo) {
            case '1':
            case 1:
                secret=process.env.JWT_SECRET_RENEW;
                break;
            case 2:
                secret=process.env.JWT_SECRET_VALIDACION;                
                break;
            case 3:
                secret=process.env.JWT_SECRET_PASS;
                break;
            default:
                break;
        }
        const { id, mail, exp, iat, tokenID }=jwt.verify(token,secret);

        const usuarioDB = await Usuario.findById(id);
        if(usuarioDB.TokenID!=tokenID) throw new Error("IDs no coinciden");
        
        req.id=id;
        req.mail=mail;
        if(tipo==1) req.remember=((exp-iat)/3600) > 48 ? true : false;

        next();
    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg: error.name
        });
    }
}

const validarJWTAdmin= async (req,res,next)=>{
    const { token }=req.body || req.query
    
    if(!token){
        return res.status(401).json({
            ok:false,
            msg:'no hay token'
        });
    }

    try {        
        let secret=process.env.JWT_SECRET_ADMIN;
                
        const { id, tokenID }=jwt.verify(token,secret);

        const adminDB = await Admin.findById(id);
        if(adminDB.TokenID!=tokenID) throw new Error("IDs no coinciden");
        
        req.id=id;

        next();
    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg: error.name
        });
    }
}

module.exports={ validarJWT, validarJWTAdmin };