const jwt =require('jsonwebtoken');

const generarJWT=(id, mail, tipo, remember)=>{
    return new Promise((resolve,reject)=>{
        const payload={ id, mail };

        let secret, expired;
        switch (tipo) {
            case 'renew':
                secret=process.env.JWT_SECRET_RENEW;
                expired=remember ? '15d' : '72h';
                break;
            case 'validacion':
                secret=process.env.JWT_SECRET_VALIDACION;
                expired='2h';
                break;
            case 'pass':
                secret=process.env.JWT_SECRET_PASS;
                expired='2h';
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