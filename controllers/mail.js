const nodemailer = require("nodemailer");
const { generarJWT } = require('../helpers/jwt');

const transporter = nodemailer.createTransport({
    maxConnections: 1,
    pool: true,
    host: process.env.MSERVICE,
    port: 465,
    secure: true,
    auth: {
        user: 'remolques@ruta202.com.ar',
        pass: process.env.MPASS
    },
    tls: {
        rejectUnauthorized: false
    },
    maxMessages: 100,
    //family: 4,
    rateDelta: 60 * 60 * 1000, // 1 hour
    rateLimit: 80         // max messages per delta
});

const notificar= async(mail,id,tipo,dato)=>{
    let token;
    if(tipo!='contacto' && tipo!='pedidoAdmin') token=await generarJWT(id, mail, tipo)
    let msg,msg2,title;
    switch (tipo) {
        case 'validacion':
            title="Verificación de cuenta";
            msg='Para terminar de configurar su cuenta siga el link.<br>'+process.env.LINK+'/validacion/'+token;
            msg2="Para terminar de configurar su cuenta siga el link.\n"+process.env.LINK+"/validacion/"+token;
        break;
        case 'password':
            title="Cambio de contraseña";
            msg='Para realizar un cambio de contraseña siga el link.<br>'+process.env.LINK+'/cambioPassword/'+token;
            msg2="Para realizar un cambio de contraseña siga el link.\n"+process.env.LINK+"/cambioPassword/"+token;
        break;
        case 'contacto':
            title="Formulario de contacto Ruta202";
            msg='Nombre: '+id.nombre+'<br>'+'Telefono: '+id.telefono+'<br>'+'Email: '+id.email+'<br>'+id.mensaje;
            msg2="Nombre: "+id.nombre+"\n"+'Telefono: '+id.telefono+'\n'+'Email: '+id.email+'\n'+id.mensaje;
        break;
        case 'pedidoAdmin':
            title="Creacion de pedido Ruta202";
            msg='Tipo: '+dato.pedido.tipo+'<br>'+'Funcionalidad: '+dato.pedido.funcionalidad+'<br>'+'Retiro: '+dato.pedido.lugarRetiro+'<br>'+'Persona lugar retiro: '+dato.pedido.personaRetiro+'<br>'+'Entrega: '+dato.pedido.lugarEntrega+'<br>'+'Persona lugar entrega: '+dato.pedido.personaEntrega+'<br>'+'Oferta: '+dato.oferta.oferta+'<br>'+'Fecha: '+dato.oferta.fecha+'<br>';
            msg2="Tipo: "+dato.pedido.tipo+"\n"+"Funcionalidad: "+dato.pedido.funcionalidad+"\n"+"Retiro: "+dato.pedido.lugarRetiro+"\n"+"Persona lugar retiro: "+dato.pedido.personaRetiro+"\n"+"Entrega: "+dato.pedido.lugarEntrega+"\n"+"Persona lugar entrega: "+dato.pedido.personaEntrega+"\n"+"Oferta: "+dato.oferta.oferta+"\n"+"Fecha: "+dato.oferta.fecha+"\n";
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