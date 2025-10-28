import mongoose from 'mongoose';
const { Schema, model } = mongoose; // Desestruturação

const usuarioSchema = new Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha_hash: { type: String, required: true }, 
    role: { 
        type: String, 
        enum: ['user', 'admin', 'supervisor'], 
        default: 'user' 
    }
}, { timestamps: true }); 

// Exporta usando 'export default'
export default model('Usuario', usuarioSchema);