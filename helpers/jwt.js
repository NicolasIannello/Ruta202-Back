const jwt =require('jsonwebtoken');
const Usuario = require('../models/usuario');

const generarJWT=(id, mail, tipo, remember)=>{
    return new Promise(async (resolve,reject)=>{
        const usuarioDB = await Usuario.findById(id);
        let tokenID = usuarioDB.TokenID;
        const payload={ id, mail, tokenID };

        let secret, expired;
        switch (tipo) {
            case 'renew':
                secret=process.env.JWT_SECRET_RENEW;
                expired=remember ? '15d' : '48h';
                break;
            case 'validacion':
                secret=process.env.JWT_SECRET_VALIDACION;
                expired='2h';
                break;
            case 'password':
                secret=process.env.JWT_SECRET_PASS;
                expired='30m';
                break;
        }

        jwt.sign(payload, secret,{
            expiresIn: expired
        }, (err,token)=>{
            if(err){
                console.log(err);
                reject(err)
            }else{
                resolve(token);
            }
        });
    })
}

module.exports={generarJWT};