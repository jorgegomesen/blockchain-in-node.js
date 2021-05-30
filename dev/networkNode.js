const port = process.argv[2];
const request = require('request-promise');
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


App.listen(port, function () {
    console.log(`escutando na porta ${port}`);
});