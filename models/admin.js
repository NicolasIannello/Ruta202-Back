const { Schema, model } = require('mongoose');

const AdminSchema = Schema({
    Usuario: { type: String, required: true },
    Contrasena: { type: String, required: true },
    TokenID: { type: Number, required: true }
});

AdminSchema.method('toJSON', function() {
    const { __v, Contrasena, ...object } = this.toObject();
    return object;
});

module.exports= model('Admin',AdminSchema);