const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    Empresa: { type: String , required: true},
    CUIT: { type: String , required: true},
    Dirección: { type: String , required: true},
    Celular: { type: String , required: true},
    Nombre: { type: String , required: true},
    Apellido: { type: String , required: true},
    EmailResponsable: { type: String , required: true},
    CondiciónFiscal: { type: String , required: true},
    Contraseña: { type: String , required: true},

    Habilitado: { type: Boolean, required: true },
    Tipo: { type: String, required: true },
    UltimaConexion: { type: String, required: true },
    Validado: { type: Boolean, required: true },
});

UsuarioSchema.method('toJSON', function() {
    const { __v, Contraseña, ...object } = this.toObject();
    return object;
});

module.exports= model('Usuario',UsuarioSchema);