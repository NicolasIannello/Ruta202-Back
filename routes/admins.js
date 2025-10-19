const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWTAdmin } = require('../middlewares/validar-jwt');
const { renewToken, login, inicioData, getUsers, getUserExtra, changeData, borrarUser, crearPedidoAdmin, verPedidosAdmin, getOfertaPedidoAdmin, verPedidoAdmin, geocodeAdmin, geocodeReverseAdmin } = require('../controllers/admin');
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

router.post('/verPedidosAdmin', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWTAdmin
],verPedidosAdmin);

router.post('/getOfertaPedidoAdmin', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('pedido','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWTAdmin
],getOfertaPedidoAdmin);

router.post('/verPedidoAdmin', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('id','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWTAdmin
],verPedidoAdmin);

router.post('/geocodeAdmin', [
    check('token','Campo obligatorio').not().isEmpty(),
    check('lugar','Campo obligatorio').not().isEmpty(),
    check('tipo','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWTAdmin
],geocodeAdmin);

router.post('/geocodeReverseAdmin', [
    check('token','Campo obligatorio').not().isEmpty(),
    check('lat','Campo obligatorio').not().isEmpty(),
    check('lng','Campo obligatorio').not().isEmpty(),
    check('tipo','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWTAdmin
],geocodeReverseAdmin);

module.exports=router;