const { Router }=require('express');
const expressFileUpload =require('express-fileupload');
const { validarJWT } = require('../middlewares/validar-jwt');
const { getImg } = require('../helpers/imagenes');

const router=Router();

router.use(expressFileUpload());

router.get('/img', getImg);

router.get('/imgCarnet',validarJWT, getImg);

module.exports=router;