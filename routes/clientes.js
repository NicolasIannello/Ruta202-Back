const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { crearPedido, getPedidos, getOfertas, borrarOferta, aceptarOferta } = require('../controllers/cliente');

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

module.exports=router;