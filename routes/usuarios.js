const { Router }=require('express');
const { check }=require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');
const { crearUsuario, validarCuenta, reValidarCuenta } = require('../controllers/usuario');
const expressFileUpload =require('express-fileupload');
const { validarJWT } = require('../middlewares/validar-jwt');

const router=Router();

router.use(expressFileUpload());

router.post('/crearUsuario', [
    check('Empresa','Campo obligatorio').not().isEmpty(),
    check('CUIT','Campo obligatorio').not().isEmpty(),
    check('Direccion','Campo obligatorio').not().isEmpty(),
    check('Celular','Campo obligatorio').isMobilePhone(),
    check('Nombre','Campo obligatorio').not().isEmpty(),
    check('Apellido','Campo obligatorio').not().isEmpty(),
    check('EmailResponsable','Campo obligatorio').isEmail(),
    check('CondicionFiscal','Campo obligatorio').not().isEmpty(),
    check('Contrasena','Campo obligatorio').not().isEmpty(),
    
    check('DNI','Campo Obligatorio').if((value, { req }) => req.body.Tipo === '0').not().isEmpty(),
    check('Cargo','Campo Obligatorio').if((value, { req }) => req.body.Tipo === '0').not().isEmpty(),
    check('Rubro','Campo Obligatorio').if((value, { req }) => req.body.Tipo === '0').not().isEmpty(),

    check('EmailOperativo','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').isEmail(),
    check('Vehiculo','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').not().isEmpty(),
    check('Marca','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').not().isEmpty(),
    check('Modelo','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').not().isEmpty(),
    check('Ano','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').not().isEmpty(),
    check('Ejes','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').not().isEmpty(),
    check('Patente','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').not().isEmpty(),
    check('CapacidadCarga','Campo Obligatorio').if((value, {req}) => req.body.Tipo === '1').not().isEmpty(),

    validarCampos
],crearUsuario);

router.post('/validar', validarJWT, validarCuenta);

router.post('/reValidar', 
    check('email','Campo obligatorio').isEmail(),
    validarCampos,
reValidarCuenta);

module.exports=router;