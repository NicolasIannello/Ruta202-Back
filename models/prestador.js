const { Schema, model } = require('mongoose');

const PrestadorSchema = Schema({
    EmailOperativo: { type: String , required: true},
    Vehículo: { type: String , required: true},
    Marca: { type: String , required: true},
    Modelo: { type: String , required: true},
    Año: { type: String , required: true},
    Ejes: { type: String , required: true},
    Patente: { type: String , required: true},
    CapacidadCarga: { type: String , required: true},
});

PrestadorSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports= model('Prestador',PrestadorSchema);