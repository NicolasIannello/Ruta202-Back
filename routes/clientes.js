const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { crearPedido, getPedidos, getOfertas, borrarOferta, aceptarOferta, geocode, geocodeReverse } = require('../controllers/cliente');

const router=Router();

router.post('/crearPedido', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('pedido','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],crearPedido);

router.post('/getPedidos', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],getPedidos);

router.post('/getOfertas', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('_id','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],getOfertas);

router.post('/borrarOferta', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('_id','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],borrarOferta);

router.post('/aceptarOferta', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('_id','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],aceptarOferta);

router.post('/geocode', [
    check('token','Campo obligatorio').not().isEmpty(),
    check('lugar','Campo obligatorio').not().isEmpty(),
    check('tipo','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],geocode);

router.post('/geocodeReverse', [
    check('token','Campo obligatorio').not().isEmpty(),
    check('lat','Campo obligatorio').not().isEmpty(),
    check('lng','Campo obligatorio').not().isEmpty(),
    check('tipo','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],geocodeReverse);

module.exports=router;