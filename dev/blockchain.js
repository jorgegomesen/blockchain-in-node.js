const sha256 = require('sha256');

function Blockchain() {
    this.chain = [];
    this.pending_transactions = [];

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
        recipient: recipient
    };

    this.pending_transactions.push(new_transaction);

    return this.getLastBlock()['index'] + 1;
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

module.exports = Blockchain;