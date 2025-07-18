const { Schema, model } = require('mongoose');

const PedidoOfertaSchema = Schema({
    UUID_Pedido: { type: String, required: true },
    prestador: { type: String, required: true },
    oferta: { type: String, required: true },
    UUID: { type: String, required: true },
});

PedidoOfertaSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports= model('PedidoOferta',PedidoOfertaSchema);