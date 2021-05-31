const request = require('request-promise');
const Express = require('express');
const App = Express();
const BodyParser = require('body-parser');
const {v1: uuid} = require('uuid');
const Blockchain = require('./blockchain');

const port = process.argv[2];

const Bitcoin = new Blockchain();

const node_addr = uuid().split('-').join('');

App.use(BodyParser.json());
App.use(BodyParser.urlencoded({extended: false}));

App.get('/blockchain', function (req, res) {
    res.send(Bitcoin);
});

App.get('/mine', function (req, res) {
    const previous_block = Bitcoin.getLastBlock();
    const previous_block_hash = previous_block['hash'];
    const current_block_data = {
        transactions: Bitcoin.pending_transactions,
        index: previous_block['index'] + 1
    };
    const nonce = Bitcoin.proofOfWork(previous_block_hash, current_block_data);
    const current_block_hash = Bitcoin.hashBlock(previous_block_hash, current_block_data, nonce);
    const new_block = Bitcoin.createNewBlock(nonce, previous_block_hash, current_block_hash);
    const request_promises = [];

    Bitcoin.network_nodes.forEach(network_node_url => {
        const request_options = {
            url: `${network_node_url}/receive-new-block`,
            method: 'POST',
            body: {new_block: new_block},
            json: true
        };

        request_promises.push(request(request_options));
    });

    Promise.all(request_promises)
        .then(data => {
            const request_options = {
                url: `${Bitcoin.current_node_url}/transaction/broadcast`,
                method: 'POST',
                body: {
                    amount: 6.25,
                    sender: '00',
                    recipient: node_addr
                },
                json: true
            };

            return request(request_options);
        })
        .then(data => {
            res.send({
                message: "Novo bloco minerado com sucesso!",
                block: new_block
            });
        });
});

App.post('/receive-new-block', function (req, res) {
    const new_block = req.body.new_block;
    const last_block = Bitcoin.getLastBlock();
    const is_hash_correct = new_block.previous_block_hash === last_block.hash;
    const is_index_correct = new_block['index'] === (last_block['index'] + 1);

    if (is_hash_correct && is_index_correct) {
        Bitcoin.chain.push(new_block);
        Bitcoin.pending_transactions = [];

        res.json({
            message: "Novo bloco foi recebido e aceitado pela blockchain!",
            new_block: new_block
        });
        return;
    }

    res.json({
        message: "Novo bloco foi rejeitado!",
        new_block: new_block
    });
});

App.post('/register-and-broadcast-node', function (req, res) {
    const new_node_url = req.body.new_node_url;
    const register_node_promises = [];

    if (Bitcoin.network_nodes.indexOf(new_node_url) == -1)
        Bitcoin.network_nodes.push(new_node_url);

    Bitcoin.network_nodes.forEach(network_node_url => {
        const request_options = {
            url: `${network_node_url}/register-node`,
            method: 'POST',
            body: {new_node_url: new_node_url},
            json: true
        };

        register_node_promises.push(request(request_options));
    });

    Promise.all(register_node_promises)
        .then(data => {
            const bulk_register_options = {
                url: `${new_node_url}/register-nodes-bulk`,
                method: 'POST',
                body: {
                    all_network_nodes: [...Bitcoin.network_nodes, Bitcoin.current_node_url]
                },
                json: true
            };

            return request(bulk_register_options)
                .then(data => {
                    res.send({message: "Novo nó registrado com sucesso na rede!"});
                });
        });
});

App.post('/register-node', function (req, res) {
    const new_node_url = req.body.new_node_url;
    const node_not_already_present = Bitcoin.network_nodes.indexOf(new_node_url) == -1;
    const not_current_node = Bitcoin.current_node_url !== new_node_url;

    if (node_not_already_present && not_current_node)
        Bitcoin.network_nodes.push(new_node_url);

    res.send({
        message: "Novo nó registrado com sucesso!"
    });
});

App.post('/register-nodes-bulk', function (req, res) {
    const all_network_nodes = req.body.all_network_nodes;

    all_network_nodes.forEach(network_node_url => {
        const node_not_already_present = Bitcoin.network_nodes.indexOf(network_node_url) == -1;
        const not_current_node = Bitcoin.current_node_url !== network_node_url;

        if (node_not_already_present && not_current_node)
            Bitcoin.network_nodes.push(network_node_url);
    });

    res.send({
        message: "Registro em lote de nós completo no novo nó!"
    });
});

App.get('/consensus', function (req, res) {
    const request_promises = [];

    Bitcoin.network_nodes.forEach(network_node_url => {
        const request_options = {
            url: `${network_node_url}/blockchain`,
            method: 'GET',
            json: true
        }

        request_promises.push(request(request_options));
    });

    Promise.all(request_promises)
        .then(blockchains => {
            const current_chain_length = Bitcoin.chain.length;
            let max_chain_length = current_chain_length;
            let new_longest_chain = null;
            let new_pending_transactions = null;

            blockchains.forEach(blockchain => {
                if (blockchain.chain.length > max_chain_length) {
                    max_chain_length = blockchain.chain.length;
                    new_longest_chain = blockchain.chain;
                    new_pending_transactions = blockchain.pending_transactions;
                }
            });

            if (!new_longest_chain || !Bitcoin.chainIsValid(new_longest_chain)) {
                res.json({
                    message: 'A cadeia não foi trocada.',
                    chain: Bitcoin.chain
                });
                return;
            }

            Bitcoin.chain = new_longest_chain;
            Bitcoin.pending_transactions = new_pending_transactions;

            res.json({
                message: 'A cadeia foi trocada.',
                chain: Bitcoin.chain
            });

        })
});

App.post('/transaction/broadcast', function (req, res) {
    const new_transaction = Bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);

    Bitcoin.addTransactionToPendingTransactions(new_transaction);

    const request_promises = [];

    Bitcoin.network_nodes.forEach(network_node_url => {
        const request_options = {
            url: `${network_node_url}/transaction`,
            method: 'POST',
            body: new_transaction,
            json: true
        };

        request_promises.push(request(request_options));
    });

    Promise.all(request_promises)
        .then(data => {
            res.json({
                message: "Transação criada e transmitida para os demais nós!"
            })
        });
});

App.post('/transaction', function (req, res) {
    const new_transaction = req.body;
    const block_index = Bitcoin.addTransactionToPendingTransactions(new_transaction);

    res.json({
        message: `A transação será adicionada ao bloco ${block_index}.`
    })
});


App.listen(port, function () {
    console.log(`escutando na porta ${port}`);
});