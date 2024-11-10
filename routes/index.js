const express = require('express');
const multer = require('multer');
const router = express.Router();
const session = require('express-session');

// Definição dos arrays em memória para usuários e solicitações
let users = [];
let solicitacoes = [];

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage(); // Usando armazenamento em memória
const upload = multer({ storage: storage });

// Configuração da Sessão
router.use(session({
  secret: 'meuSegredo', // Modifique para um valor seguro
  resave: false,
  saveUninitialized: true,
}));

// Página inicial - Login
router.get('/', (req, res) => {
  res.render('index', { error: req.session.error }); // Passando erro se houver
  req.session.error = null; // Limpar a mensagem de erro após exibição
});

// Processar login
router.post('/login', (req, res) => {
 
  const { email, password } = req.body;

  // Procurar o usuário no array de usuários
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Se o usuário for encontrado, armazenamos a sessão
    req.session.user = user;
    return res.redirect('/perfil'); // Redirecionar para o perfil do usuário
  } else {
    // Se as credenciais estiverem erradas, exibe uma mensagem de erro
    req.session.error = 'Credenciais inválidas';
    req.session.error = null;
    return res.redirect('/'); // Redireciona de volta para a página de login
  }
});

// Página inicial - Login
router.get('/cadastro', (req, res) => {
  res.render('cadastro', { error: req.session.error }); // Passando erro se houver
  req.session.error = null; // Limpar a mensagem de erro após exibição
});

// Processar o cadastro de novos usuários
router.post('/register', (req, res) => {
  const { name, email, matricula, password } = req.body;

  // Verificar se o usuário já existe (simples validação)
  if (users.some(user => user.email === email)) {
    req.session.error = "Usuario Já cadastrado!"
    return res.redirect('/cadastro');
  }

  // Criando um novo usuário
  const newUser = { id: users.length + 1, name, email, matricula, password };
  users.push(newUser);

  // Redirecionar para a página inicial (login)
  res.redirect('/');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Erro ao sair');
    }
    res.redirect('/'); // Redireciona para a página de login após logout
  });
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
  if (!req.session.user) {
    return res.redirect('/'); // Redirecionar para login se não estiver logado
  }
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
