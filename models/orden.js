const { Schema, model } = require('mongoose');

const OrdenSchema = Schema({
    prestador: { type: String, require:true },
    usuario: { type: String, require:true },
    pdf: { type: String, require:true },
    time: { type: String, require:true },
    firma: { type: Boolean, require:true },
    ip: { type: String, require:true },
});

OrdenSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports= model('Orden',OrdenSchema);