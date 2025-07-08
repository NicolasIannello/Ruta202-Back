const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWTAdmin } = require('../middlewares/validar-jwt');
const { renewToken, login, inicioData } = require('../controllers/admin');

const router=Router();

router.post('/login', [
    check('admin').not().isEmpty(),
    check('password','el campo es obligatorio').not().isEmpty(),
    validarCampos
],login);

router.post('/renew', validarJWTAdmin, renewToken);

router.post('/inicioData', validarJWTAdmin, inicioData);

module.exports=router;