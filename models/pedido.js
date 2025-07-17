const { Schema, model } = require('mongoose');

const PedidoSchema = Schema({
    tipo: { type: String, required: true },
    funcionalidad: { type: String, required: true },
    lugarRetiro: { type: String, required: true },
    lugarTipo: { type: String, required: true },
    lugarEntrega: { type: String, required: true },
    personaEntrega: { type: String, required: true },
    personaRetiro: { type: String, required: true },
    UUID: { type: String, required: true },
    Cliente: { type: String, required: true },
    disponible: { type: Boolean, required: true },
    prestador: { type: String },
});

PedidoSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports= model('Pedido',PedidoSchema);