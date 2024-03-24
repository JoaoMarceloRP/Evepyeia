const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'evepyeiadb'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco de dados MySQL estabelecida');
});

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query('SELECT * FROM usuarios WHERE nome = ? AND senha = ?', [username, password], (error, results) => {
        if (error) {
            console.error('Erro ao verificar as credenciais:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
            return;
        }

        if (results.length === 1) {
            req.session.user = username;
            res.status(200).json({ message: 'Login bem-sucedido' });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas' });
        }
    });
});


app.post('/signup', (req, res) => {
    const { username, password, email, address, cpf } = req.body;

    connection.query('SELECT * FROM usuarios WHERE nome = ?', [username], (error, results) => {
        if (error) {
            console.error('Erro ao verificar nome de usuário:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
            return;
        }

        if (results.length > 0) {
            res.status(400).json({ message: 'Nome de usuário já em uso' });
            return;
        }

        connection.query('INSERT INTO usuarios (nome, senha, email, endereco, cpf) VALUES (?, ?, ?, ?, ?)', [username, password, email, address, cpf], (error, results) => {
            if (error) {
                console.error('Erro ao criar conta:', error);
                res.status(500).json({ message: 'Erro interno do servidor' });
                return;
            }
            res.status(200).json({ message: 'Conta criada com sucesso' });
        });
    });
});

app.get('/home.html', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
