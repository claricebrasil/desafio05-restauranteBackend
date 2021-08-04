const knex = require("../conexao"); 
const validacaoCadastroProduto = require("../validacoes/validacaoCadastroProduto");
const validacaoAtualizacaoProduto = require("../validacoes/validacaoAtualizacaoProduto");

async function listarProdutos(req, res) {
    const { restaurante } = req;
    
    try {
        const produtos = await knex('produto').where({ restaurante_id: restaurante.id }).orderBy('id');

        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

async function obterProduto(req, res) {
    const { restaurante } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produto').where({ id, restaurante_id: restaurante.id }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado.');
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

async function cadastrarProduto(req, res) {
    const { restaurante } = req;
    const { nome, descricao, imagem, preco, ativo, permiteObservacoes } = req.body;

    try {
        const erroValidarCadastroProduto = validacaoCadastroProduto(nome, descricao, imagem, preco, ativo, permiteObservacoes);

        if (erroValidarCadastroProduto) {
            return res.status(400).json(erroValidarCadastroProduto);
        }

        const nomeProdutoCadastrado = await knex('produto').where({ restaurante_id: restaurante.id }).where('nome', 'ilike', nome);

        if (nomeProdutoCadastrado.length > 0) {
            return res.status(400).json('Já existe um produto com esse nome.');
        }

        const produtoCadastrado = await knex('produto').insert({
            restaurante_id: restaurante.id,
            nome,
            descricao,
            imagem,
            preco,
            ativo,
            permite_observacoes: permiteObservacoes
        });

        if (!produtoCadastrado) {
            return res.status(400).json('O produto não foi cadastrado.');
        }

        return res.status(200).json();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

async function atualizarProduto(req, res) {
    const { restaurante } = req;
    const { id } = req.params;
    const { nome, descricao, imagem, preco, permiteObservacoes } = req.body;

    try {
        const produtoEncontrado = await knex('produto').where({ id, restaurante_id: restaurante.id }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado.');
        }

        const erroValidarAtualizacaoProduto = validacaoAtualizacaoProduto(nome, descricao, imagem, preco, permiteObservacoes);

        if (erroValidarAtualizacaoProduto) {
            return res.status(400).json(erroValidarAtualizacaoProduto);
        }

        const produtoAtualizado = await knex('produto').where({ id }).update({
            nome, 
            descricao,
            imagem,
            preco,
            permite_observacoes: permiteObservacoes
        });

        if (!produtoAtualizado) {
            return res.status(400).json('O produto não foi atualizado.');
        }

        return res.status(200).json();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

async function excluirProduto(req, res) {
    const { restaurante } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produto').where({ id, restaurante_id: restaurante.id }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado.');
        }

        if (produto.ativo) {
            return res.status(400).json('Não é permitido a exclusão de produtos ativos.');
        }

        const produtoExcluido = await knex('produto').where({ id, restaurante_id: restaurante.id }).del();

        if (!produtoExcluido) {
            return res.status(400).json('O produto não foi excluído.');
        }

        return res.status(200).json();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

async function ativarProduto(req, res) {
    const { restaurante } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produto').where({ id, restaurante_id: restaurante.id }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado.');
        }

        const produtoAtivo = await knex('produto').where({ id }).update({
            ativo: true
        });

        if (!produtoAtivo) {
            return res.status(400).json('O produto não foi ativado.');
        }

        return res.status(200).json();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

async function desativarProduto(req, res) {
    const { restaurante } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produto').where({ id, restaurante_id: restaurante.id }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado.');
        }

        const produtoDesativado = await knex('produto').where({ id }).update({
            ativo: false
        });

        if (!produtoDesativado) {
            return res.status(400).json('O produto não foi desativado.');
        }

        return res.status(200).json();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto,
    ativarProduto,
    desativarProduto
}