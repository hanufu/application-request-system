const express = require('express');
const multer = require('multer');
const session = require('express-session');
const router = express.Router();

// Definição dos arrays em memória para usuários e solicitações
let users = [];
let solicitacoes = [];
const ADM = { id: users.length + 1, name: "Administrador", email: "admin@gmail.com", matricula: "000000", password: "admin123" };

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.use(session({
  secret: 'meuSegredo', 
  resave: false,
  saveUninitialized: true
}));

// Página inicial - Login
router.get('/', (req, res) => {
  const error = req.session.error; 
  req.session.error = null;
  res.render('index', { error }); 
});

// Processar login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verifica se o usuário é o administrador
  if (email === ADM.email && password === ADM.password) {
    req.session.user = ADM; 
    return res.redirect('/admin');
  }

  // Verifica se é um usuário comum
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    req.session.user = user; 
    return res.redirect('/perfil'); 
  } else {
    req.session.error = 'Credenciais inválidas';
    return res.redirect('/'); 
  }
});

// Página de cadastro
router.get('/cadastro', (req, res) => {
  const error = req.session.error; 
  req.session.error = null; 
  res.render('cadastro', { error }); 
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
    res.redirect('/');
  });
});

// Tela de Solicitação de Dispensa
router.get('/solicitacao', (req, res) => {
  res.render('solicitacao');
});

// Processar solicitação de dispensa
router.post('/solicitacao', upload.single('documento'), (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); 
  }

  const { justificativa } = req.body;
  const documento = req.file ? req.file.buffer : null; 

  const newSolicitacao = {
    id: solicitacoes.length + 1,
    userId: req.session.user.id, 
    justificativa,
    documento,
    status: 'Pendente'
  };

  solicitacoes.push(newSolicitacao);
  res.redirect('/perfil');
});

// Perfil do Aluno
router.get('/perfil', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/'); 
  }

  const user = req.session.user;
  const userSolicitacoes = solicitacoes.filter(solicitacao => solicitacao.userId === user.id); 
  res.render('perfil', { user, solicitacoes: userSolicitacoes }); 
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
