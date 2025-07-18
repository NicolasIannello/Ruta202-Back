const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { verPedidos, ofertaPedido } = require('../controllers/prestador');

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
    check('_id','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],ofertaPedido);

module.exports=router;