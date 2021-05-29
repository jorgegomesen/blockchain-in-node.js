const sha256 = require('sha256');

function Blockchain() {
    this.chain = [];
    this.new_transactions = [];
}

Blockchain.prototype.createNewBlock = function (nonce, previous_block_hash, hash){
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.new_transactions,
        nonce: nonce,
        hash: hash,
        previousBlockHash: previous_block_hash
    };

    this.new_transactions = [];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1];
}

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const new_transaction = {
        amount: amount,
        sender: sender,
        recipient: recipient
    };

    this.new_transactions.push(new_transaction);

    return this.getLastBlock()['index'] + 1;
}

Blockchain.prototype.hashBlock = function (previous_block_hash, current_block_data, nonce) {
    const data_str = `${previous_block_hash}${nonce.toString()}${JSON.stringify(current_block_data)}`;

    return sha256(data_str);
}

module.exports = Blockchain;