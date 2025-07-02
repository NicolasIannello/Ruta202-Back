const jwt = require("jsonwebtoken");

const validarJWT=(req,res,next)=>{
    const { token, tipo }=req.body
    
    if(!token){
        return res.status(401).json({
            ok:false,
            msg:'no hay token'
        });
    }

    try {        
        let secret;
        switch (tipo) {
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
        const { id, mail, exp, iat }=jwt.verify(token,secret);
        
        req.id=id;
        req.mail=mail;
        if(tipo==1) req.remember=((exp-iat)/3600) > 48 ? true : false;

        next();
    } catch (error) {
        if(error.name=='TokenExpiredError'){
            return res.status(401).json({
                ok:false,
                msg:'token expirado'
            });
        }
        return res.status(401).json({
            ok:false,
            msg:'token mal'
        });
    }
}

module.exports={validarJWT};