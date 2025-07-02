const nodemailer = require("nodemailer");
const { generarJWT } = require('../helpers/jwt');

const notificar= async(mail,id,tipo)=>{    
    const transporter = nodemailer.createTransport({
        maxConnections: 1,
        pool: true,
        host: process.env.MSERVICE,
        port: 465,
        secure: true,
        auth: {
            user: 'remolques@ruta202.com.ar',
            pass: process.env.MPASS
        }
    });
    
    let token=await generarJWT(id, mail, tipo)
    let msg,msg2,title;
    switch (tipo) {
        case 'validacion':
            title="Verificación de cuenta";
            msg='Para terminar de configurar su cuenta siga el link.<br>'+process.env.LINK+'/validacion/'+token;
            msg2="Para terminar de configurar su cuenta siga el link.\n"+process.env.LINK+"/validacion/"+token;
        break;
        case 4:
            title="Cambio de contraseña";
            msg='Para realizar un cambio de contraseña siga el link.<br>'+process.env.LINK+'/cambio/'+token;
            msg2="Para realizar un cambio de contraseña siga el link.\n"+process.env.LINK+"/cambio/"+token;
        break;
    }

    await transporter.sendMail({
        from: '"Ruta202 Remolques" <remolques@ruta202.com.ar>',
        to: mail,
        subject: title,
        text: msg2,
        html: msg,
    }, function(error, info){
        if (error) {
            console.log(error);
            return false;
        }
    });
    
    return true;
};

module.exports={ notificar }