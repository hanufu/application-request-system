const express = require('express');
const router = express.Router();

// Página inicial
router.get('/', (req, res) => res.render('index'));

//pagina de cadastro
router.get('/cadastro', (req, res) => res.render('cadastro'));

// Tela de solicitação
router.get('/solicitacao', (req, res) => res.render('solicitacao'));

// Perfil do aluno
router.get('/perfil', (req, res) => res.render('perfil'));

// Página de administração
router.get('/admin', (req, res) => res.render('admin'));

module.exports = router;
