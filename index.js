const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");

const app = express();
const port = config.port || 5000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Configuração do banco de dados PostgreSQL
const conString = config.urlConnection;
const client = new Client(conString);

client.connect(function (err) {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
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
        const query = 'SELECT * FROM pedidos';
        const result = await client.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
});

// Rota para criar um novo pedido
app.post("/api/pedidos", async (req, res) => {
    const { cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega } = req.body;
    try {
        const query = 'INSERT INTO pedidos (cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
        const result = await client.query(query, [cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega]);
        const novoPedido = result.rows[0];
        res.status(201).json(novoPedido);
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(400).json({ error: 'Erro ao criar pedido' });
    }
});

// Rota para atualizar um pedido específico
app.put("/api/pedidos/:id", async (req, res) => {
    const pedidoId = req.params.id;
    const { cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega, status } = req.body;
    try {
        const query = 'UPDATE pedidos SET cliente=$1, endereco=$2, tipo_pizza=$3, descricao=$4, valor=$5, tempo_entrega=$6, status=$7 WHERE id=$8 RETURNING *';
        const result = await client.query(query, [cliente, endereco, tipo_pizza, descricao, valor, tempo_entrega, status, pedidoId]);
        const pedidoAtualizado = result.rows[0];
        res.json(pedidoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        res.status(400).json({ error: 'Erro ao atualizar pedido' });
    }
});

// Rota para deletar um pedido específico
app.delete("/api/pedidos/:id", async (req, res) => {
    const pedidoId = req.params.id;
    try {
        const query = 'DELETE FROM pedidos WHERE id=$1 RETURNING *';
        const result = await client.query(query, [pedidoId]);
        const pedidoDeletado = result.rows[0];
        res.json(pedidoDeletado);
    } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        res.status(400).json({ error: 'Erro ao deletar pedido' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
