const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWTAdmin } = require('../middlewares/validar-jwt');
const { renewToken, login, inicioData, getUsers, getUserExtra } = require('../controllers/admin');

const router=Router();

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

module.exports=router;