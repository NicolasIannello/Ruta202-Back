const { Schema, model, mongoose } = require('mongoose');

const OrdenSchema = Schema({
    prestador: { type: String, require:true },
    usuario: { type: String, require:true },
    pdf: { type: String, require:true },
    copia: { type: String, require:true },
    firma: { type: mongoose.Schema.Types.Mixed, required: true }
});

OrdenSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports= model('Orden',OrdenSchema);