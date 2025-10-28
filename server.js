import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis do .env

// Importa suas rotas (note o .js no final)
import usuarioRoutes from './routes/usuarios.js';

// Inicializa o aplicativo Express
const app = express();
const PORT = process.env.PORT || 5000;

// === Configuração de Middlewares ===
app.use(cors()); 
app.use(express.json()); 

// === Rota de Teste ===
app.get('/api/teste', (req, res) => {
    res.json({ message: 'Servidor Express está funcionando!' });
});

// === LIGAR AS NOVAS ROTAS DA API ===
app.use('/api/usuarios', usuarioRoutes);

// === Conexão com o Banco de Dados ===
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB conectado com sucesso.');

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error('Falha ao conectar ao MongoDB:', error.message);
        process.exit(1); 
    }
};

connectDB();