const { Router }=require('express');
const expressFileUpload =require('express-fileupload');
const { validarJWT, validarJWTAdmin } = require('../middlewares/validar-jwt');
const { getImg, getOrden, getOrden2 } = require('../helpers/imagenes');

const router=Router();

router.use(expressFileUpload());

router.get('/img', getImg);

router.get('/imgCarnet',validarJWT, getImg);

router.get('/imgCarnetAdmin',validarJWTAdmin, getImg);

router.get('/pdf',validarJWT, getOrden);

router.get('/pdf2', getOrden2);

module.exports=router;