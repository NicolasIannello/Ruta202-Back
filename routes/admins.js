const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWTAdmin } = require('../middlewares/validar-jwt');
const { renewToken, login, inicioData, getUsers, getUserExtra, changeData, borrarUser, crearPedidoAdmin } = require('../controllers/admin');
const expressFileUpload =require('express-fileupload');

const router=Router();

router.use(expressFileUpload());

router.post('/login', [
    check('admin').not().isEmpty(),
    check('password','el campo es obligatorio').not().isEmpty(),
    validarCampos
],login);

router.post('/renew', validarJWTAdmin, renewToken);

router.post('/inicioData', validarJWTAdmin, inicioData);

router.post('/getUsers', validarJWTAdmin, getUsers);

router.post('/getUserExtra', [
    check('Tipo','el campo es obligatorio').not().isEmpty(),
    check('UUID','el campo es obligatorio').not().isEmpty(),
    validarCampos,
    validarJWTAdmin
], getUserExtra);

router.post('/changeData', validarJWTAdmin, changeData);

router.post('/borrarUser', [
    check('id','el campo es obligatorio').not().isEmpty(),
    validarCampos,
    validarJWTAdmin
], borrarUser);

router.post('/crearPedidoAdmin', [
    check('pedido','Campo obligatorio').not().isEmpty(),
    check('oferta','Campo obligatorio').not().isEmpty(),
    validarCampos,
    validarJWTAdmin
], crearPedidoAdmin);

module.exports=router;