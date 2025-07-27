const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { verPedidos, ofertaPedido, verPedido, getOfertaPedido, getOfertas } = require('../controllers/prestador');

const router=Router();

router.post('/verPedidos', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],verPedidos);

router.post('/ofertaPedido', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('oferta','Campo obligatorio').not().isEmpty(),
    check('idP','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],ofertaPedido);

router.post('/verPedido', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('id','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],verPedido);

router.post('/getOfertaPedido', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('pedido','Campo obligatorio').not().isEmpty(),
    check('prestador','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],getOfertaPedido);

router.post('/getOfertas', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('UUID','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],getOfertas);

module.exports=router;