const sha256 = require('sha256');
const current_node_url = process.argv[3];
const {v1: uuid} = require('uuid');

function Blockchain() {
    this.chain = [];
    this.pending_transactions = [];
    this.network_nodes = [];
    this.current_node_url = current_node_url;

    this.createNewBlock(100, '0', '0');
}

Blockchain.prototype.createNewBlock = function (nonce, previous_block_hash, hash) {
    const new_block = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pending_transactions,
        nonce: nonce,
        hash: hash,
        previous_block_hash: previous_block_hash
    };

    this.pending_transactions = [];
    this.chain.push(new_block);

    return new_block;
}

Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const new_transaction = {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transaction_id: uuid().split('-').join('')
    };

    return new_transaction;
}

Blockchain.prototype.hashBlock = function (previous_block_hash, current_block_data, nonce) {
    const data_str = `${previous_block_hash}${nonce.toString()}${JSON.stringify(current_block_data)}`;

    return sha256(data_str);
}

Blockchain.prototype.proofOfWork = function (previous_block_hash, current_block_data) {
    let nonce = 0;
    let hash = this.hashBlock(previous_block_hash, current_block_data, nonce);

    while (hash.substr(0, 4) !== '0000')
        hash = this.hashBlock(previous_block_hash, current_block_data, ++nonce);

    return nonce;
}

Blockchain.prototype.chainIsValid = function (blockchain) {
    let current_block = null;
    let previous_block = null;
    let block_hash = null;
    const blockchain_length = blockchain.length;

    for (let it = 1; it < blockchain_length; it++) {
        current_block = blockchain[it];
        previous_block = blockchain[it - 1];
        block_hash = this.hashBlock(previous_block['hash'], {
            transactions: current_block['transactions'],
            index: current_block['index']
        }, current_block['nonce']);

        if (block_hash.substring(0, 4) !== "0000")
            return false;

        if (current_block['previous_block_hash'] !== previous_block['hash'])
            return false;
    }

    const genesis_block = blockchain[0];
    const is_nonce_correct = genesis_block['nonce'] === 100;
    const is_previous_block_hash_correct = genesis_block['previous_block_hash'] === '0';
    const is_hash_correct = genesis_block['hash'] === '0';
    const are_transactions_correct = genesis_block['transactions'].length === 0;

    return is_nonce_correct && is_previous_block_hash_correct && is_hash_correct && are_transactions_correct;
}

Blockchain.prototype.addTransactionToPendingTransactions = function (transaction_obj) {
    this.pending_transactions.push(transaction_obj);
    return this.getLastBlock()['index'] + 1;
}

module.exports = Blockchain;