const { Schema, model } = require('mongoose');

const AdminSchema = Schema({
    Usuario: { type: String, required: true },
    Contrasena: { type: String, required: true },
});

AdminSchema.method('toJSON', function() {
    const { __v, Contraseña, ...object } = this.toObject();
    return object;
});

module.exports= model('Admin',AdminSchema);