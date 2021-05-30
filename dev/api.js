const Express = require('express');
const App = Express();
const BodyParser = require('body-parser');
const {v1: uuid} = require('uuid');
const Blockchain = require('./blockchain');
const Bitcoin = new Blockchain();

App.use(BodyParser.json());
App.use(BodyParser.urlencoded({extended: false}));

App.get('/blockchain', function (req, res) {
    res.send(Bitcoin);
});

App.post('/transaction', function (req, res) {
    const block_index = Bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
    res.send({message: `A transação será posta no bloco ${block_index}.`});
});

App.get('/mine', function (req, res) {
    const previous_block = Bitcoin.getLastBlock();
    const previous_block_hash = previous_block['hash'];
    const current_block_data = {
        transactions: Bitcoin.pending_transactions,
        index: previous_block['index'] + 1
    };
    const nonce = Bitcoin.proofOfWork(previous_block_hash, current_block_data);

    const node_addr = uuid().split('-').join('');

    Bitcoin.createNewTransaction(6.25, '00', node_addr);

    const current_block_hash = Bitcoin.hashBlock(previous_block_hash, current_block_data, nonce);

    const new_block = Bitcoin.createNewBlock(nonce, previous_block_hash, current_block_hash);

    res.send({
        message: "Novo bloco minerado com sucesso!",
        block: new_block
    });
});


App.listen(3000, function () {
    console.log('escutando na porta 3000');
});