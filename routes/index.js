const express = require('express');
const multer = require('multer');
const router = express.Router();

// Definição dos arrays em memória para usuários e solicitações
let users = [];
let solicitacoes = [];

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage(); // Usando armazenamento em memória
const upload = multer({ storage: storage });

// Página inicial - Login
router.get('/', (req, res) => {
  res.render('index'); // Renderizando a página de login (index.ejs)
});

// Página de Cadastro
router.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

// Processar o cadastro de novos usuários
router.post('/register', (req, res) => {
  const { name, email, matricula, password } = req.body;

  // Verificar se o usuário já existe (simples validação)
  if (users.some(user => user.email === email)) {
    return res.send('Usuário já cadastrado');
  }

  // Criando um novo usuário
  const newUser = { id: users.length + 1, name, email, matricula, password };
  users.push(newUser);

  // Redirecionar para a página inicial (login)
  res.redirect('/');
});

// Tela de Solicitação de Dispensa
router.get('/solicitacao', (req, res) => {
  res.render('solicitacao');
});

// Processar solicitação de dispensa
router.post('/solicitacao', upload.single('documento'), (req, res) => {
  const { name, email, matricula, justificativa } = req.body;
  const documento = req.file ? req.file.buffer : null; // Armazenando o arquivo na memória

  // Criando uma nova solicitação
  const newSolicitacao = {
    id: solicitacoes.length + 1,
    user: { name, email, matricula },
    justificativa,
    documento,
    status: 'Pendente'
  };
  
  solicitacoes.push(newSolicitacao);
  
  // Enviar resposta confirmando o envio da solicitação
  res.send('Solicitação enviada');
});

// Perfil do Aluno
router.get('/perfil', (req, res) => {
  res.render('perfil', { solicitacoes });
});

// Página de Administração
router.get('/admin', (req, res) => {
  res.render('admin', { solicitacoes });
});

// Aprovar ou Rejeitar Solicitação
router.post('/admin/solicitacao/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Encontrar a solicitação pelo ID
  const solicitacao = solicitacoes.find(s => s.id == id);

  // Verificar se a solicitação existe
  if (solicitacao) {
    solicitacao.status = status;
    res.redirect('/admin');
  } else {
    res.send('Solicitação não encontrada');
  }
});

module.exports = router;
