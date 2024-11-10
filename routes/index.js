const express = require('express');
const multer = require('multer');
const session = require('express-session');
const router = express.Router();

// Definição dos arrays em memória para usuários e solicitações
let users = [];
let solicitacoes = [];
  const newUser = { id: users.length + 1, name: "ADM", email: "eduardo20003131@gmail.com", matricula:"24127", password: "123"};
  users.push(newUser);
// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage(); // Usando armazenamento em memória
const upload = multer({ storage: storage });

// Middleware de sessão (deve ser colocado antes de qualquer uso de req.session)
router.use(session({
  secret: 'meuSegredo', // Troque por um valor seguro
  resave: false,
  saveUninitialized: true
}));

// Página inicial - Login
router.get('/', (req, res) => {
  res.render('index'); 
});

// Processar login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    req.session.user = user;
    return res.redirect('/perfil'); // Redirecionar para o perfil do usuário
  } else {
    req.session.error = 'Credenciais inválidas';
    return res.redirect('/'); // Redireciona de volta para a página de login
  }
});

// Página de cadastro
router.get('/cadastro', (req, res) => {
  res.render('cadastro'); 
});

// Processar o cadastro de novos usuários
router.post('/register', (req, res) => {
  const { name, email, matricula, password } = req.body;

  if (users.some(user => user.email === email)) {
    req.session.error = "Usuário já cadastrado!";
    return res.redirect('/cadastro');
  }

  const newUser = { id: users.length + 1, name, email, matricula, password };
  users.push(newUser);
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

  const newSolicitacao = {
    id: solicitacoes.length + 1,
    user: { name, email, matricula },
    justificativa,
    documento,
    status: 'Pendente'
  };

  solicitacoes.push(newSolicitacao);
  res.send('Solicitação enviada');
});

// Perfil do Aluno
router.get('/perfil', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); // Redireciona para o login se não houver sessão de usuário
  }

  const user = req.session.user; // Pega o usuário da sessão
  res.render('perfil', { user, solicitacoes }); // Envia os dados do usuário e solicitações para a página
});

// Página de Administração
router.get('/admin', (req, res) => {
  res.render('admin', { solicitacoes });
});

// Aprovar ou Rejeitar Solicitação
router.post('/admin/solicitacao/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const solicitacao = solicitacoes.find(s => s.id == id);

  if (solicitacao) {
    solicitacao.status = status;
    res.redirect('/admin');
  } else {
    res.send('Solicitação não encontrada');
  }
});

module.exports = router;
