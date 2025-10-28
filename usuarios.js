import express from 'express';
import bcrypt from 'bcrypt'; 
import Usuario from '../models/usuario.js'; 

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        // Usamos .select('-senha_hash') para nunca retornar a senha criptografada
        const usuarios = await Usuario.find().select('-senha_hash');
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// -----------------------------------------
// Rota POST: /api/usuarios (A NOVA ROTA)
// -----------------------------------------
// Cria um novo usuário
router.post('/', async (req, res) => {
    try {
        // 1. Pegamos os dados do corpo (body) da requisição
        const { nome, email, senha, role } = req.body;

        // 2. Verificamos se todos os campos obrigatórios vieram
        if (!nome || !email || !senha) {
            return res.status(400).json({ message: 'Por favor, envie nome, email e senha.' });
        }

        // 3. Verificamos se o usuário já existe
        const usuarioExistente = await Usuario.findOne({ email: email });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }

        // 4. Criptografamos a senha (A PARTE MAIS IMPORTANTE)
        // "salt" é um "tempero" aleatório adicionado à senha antes de criptografar
        const salt = await bcrypt.genSalt(10);
        const senha_hash = await bcrypt.hash(senha, salt);

        // 5. Criamos a nova instância do usuário
        const novoUsuario = new Usuario({
            nome: nome,
            email: email,
            senha_hash: senha_hash, // <-- Salvamos o HASH, não a senha pura!
            role: role // Se 'role' não for enviado, o 'default' do Schema será usado
        });

        // 6. Salvamos o usuário no banco de dados
        const usuarioSalvo = await novoUsuario.save();

        // 7. Retornamos uma resposta de sucesso (201 = Criado)
        // Não enviamos o hash da senha de volta por segurança.
        res.status(201).json({
            id: usuarioSalvo._id,
            nome: usuarioSalvo.nome,
            email: usuarioSalvo.email,
            role: usuarioSalvo.role
        });

    } catch (err) {
        // Captura erros (ex: falha de validação do Mongoose)
        res.status(500).json({ message: 'Erro ao criar usuário', error: err.message });
    }
});

// Exporta o router
export default router;