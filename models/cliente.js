const { Schema, model } = require('mongoose');

const ClienteSchema = Schema({
    DNI: { type: String , required: true},
    Cargo: { type: String , required: true},
    Rubro: { type: String , required: true},
});

ClienteSchema.method('toJSON', function() {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports= model('Cliente',ClienteSchema);