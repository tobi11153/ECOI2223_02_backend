//Gabriel Souza Santos

const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();
const port = config.port || 5000;

// Middleware para JSON e CORS
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Configuração do banco de dados PostgreSQL
const client = new Client(config.urlConnection);

client.connect(err => {
    if (err) {
        console.error('Não foi possível conectar ao banco.', err);
        process.exit(1); // Encerra o processo se não conseguir conectar
    }
    console.log('Conexão ao banco de dados estabelecida.');
});

// Rota inicial para verificar se o servidor está funcionando
app.get("/", (req, res) => {
    res.send("Servidor backend está funcionando corretamente.");
});

// Rota para buscar todos os pedidos
app.get("/api/pedidos", async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM pedidos'); // Consulta todos os pedidos
        res.json(result.rows); // Retorna os pedidos em formato JSON
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
});

// Rota para criar um novo pedido
app.post("/api/pedidos", async (req, res) => {
    const { cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO pedidos (cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega]
        );
        res.status(201).json(result.rows[0]); // Retorna o novo pedido criado
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(400).json({ error: 'Erro ao criar pedido' });
    }
});

// Rota para atualizar um pedido específico
app.put("/api/pedidos/:id", async (req, res) => {
    const { id } = req.params;
    const { cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega, status } = req.body;
    try {
        const result = await client.query(
            'UPDATE pedidos SET cliente=$1, endereco=$2, tipo_pizza=$3, descricao=$4, valor=$5, tempo_entrega=$6, status=$7 WHERE id=$8 RETURNING *',
            [cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega, status, id]
        );
        res.json(result.rows[0]); // Retorna o pedido atualizado
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        res.status(400).json({ error: 'Erro ao atualizar pedido' });
    }
});

// Rota para deletar um pedido específico
app.delete("/api/pedidos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await client.query('DELETE FROM pedidos WHERE id=$1 RETURNING *', [id]);
        res.json(result.rows[0]); // Retorna o pedido deletado
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        res.status(400).json({ error: 'Erro ao deletar pedido' });
    }
});

// Iniciar o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

module.exports = app;
