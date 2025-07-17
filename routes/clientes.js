const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { crearPedido } = require('../controllers/cliente');

const router=Router();

router.post('/crearPedido', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),
    check('pedido','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],crearPedido);

module.exports=router;