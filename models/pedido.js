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
    oferta: { type: String },
    estado: { type: String, required: true },
    lugarRetiroLatLng: { type: {lat:Number, lng:Number}, required: true },
    lugarEntregaLatLng: { type: {lat:Number, lng:Number}, required: true },
    selloCliente: { type: Boolean, required: true },
    selloPrestador: { type: Boolean, required: true },
    ordenRetiro: { type: String },
    admin: { type: Boolean, required: true },
});

PedidoSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports= model('Pedido',PedidoSchema);