const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    Empresa: { type: String , required: true},
    CUIT: { type: String , required: true},
    Direccion: { type: String , required: true},
    Celular: { type: String , required: true},
    Nombre: { type: String , required: true},
    Apellido: { type: String , required: true},
    EmailResponsable: { type: String , required: true, unique: true},
    CondicionFiscal: { type: String , required: true},
    Contrasena: { type: String , required: true},

    Habilitado: { type: Boolean, required: true },
    Tipo: { type: String, required: true },
    UltimaConexion: { type: String, required: true },
    Validado: { type: Boolean, required: true },
    UUID: { type: String, required: true },
    TokenID: { type: Number, required: true },
});

UsuarioSchema.method('toJSON', function() {
    const { __v, Contrasena, TokenID, ...object } = this.toObject();
    return object;
});

module.exports= model('Usuario',UsuarioSchema);