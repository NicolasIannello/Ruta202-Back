const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { verPedidos } = require('../controllers/prestador');

const router=Router();

router.post('/verPedidos', [
    check('tipo','Campo obligatorio').not().isEmpty(),
    check('token','Campo obligatorio').not().isEmpty(),

    validarCampos,validarJWT
],verPedidos);

module.exports=router;