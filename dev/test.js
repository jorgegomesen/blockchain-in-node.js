const Blockchain = require('./blockchain');

const bitcoin = new Blockchain();

const blockchain1 = [
    {
        "index": 1,
        "timestamp": 1622425303809,
        "transactions": [],
        "nonce": 100,
        "hash": "0",
        "previous_block_hash": "0"
    },
    {
        "index": 2,
        "timestamp": 1622425493473,
        "transactions": [
            {
                "amount": 20,
                "sender": "OIUOEDJETH8754DHKD",
                "recipient": "78SHNEG45DER56",
                "transaction_id": "c6e76e00c1b111eb9cfa9fbb764c67fa"
            }
        ],
        "nonce": 21494,
        "hash": "00002ac2d3809e3a7193b083e5c41cc2cbbcb4a5b7dffa30032568aea462eef2",
        "previous_block_hash": "0"
    },
    {
        "index": 3,
        "timestamp": 1622425518453,
        "transactions": [
            {
                "amount": 6.25,
                "sender": "00",
                "recipient": "5a963e20c1b111eb9cfa9fbb764c67fa",
                "transaction_id": "cba36f70c1b111eb9cfa9fbb764c67fa"
            },
            {
                "amount": 2000,
                "sender": "1358079784",
                "recipient": "2508537122",
                "transaction_id": "d4997110c1b111eb9cfa9fbb764c67fa"
            },
            {
                "amount": 2345,
                "sender": "1363856351",
                "recipient": "0182481162",
                "transaction_id": "d60efa10c1b111eb9cfa9fbb764c67fa"
            },
            {
                "amount": 827,
                "sender": "6503740900",
                "recipient": "9726296188",
                "transaction_id": "d78434f0c1b111eb9cfa9fbb764c67fa"
            }
        ],
        "nonce": 40591,
        "hash": "00005e2e79e62664ce1eff5c5dd523083715433b61d45dc7cacbade3cba8ae25",
        "previous_block_hash": "00002ac2d3809e3a7193b083e5c41cc2cbbcb4a5b7dffa30032568aea462eef2"
    },
    {
        "index": 4,
        "timestamp": 1622425528676,
        "transactions": [
            {
                "amount": 6.25,
                "sender": "00",
                "recipient": "5a963e20c1b111eb9cfa9fbb764c67fa",
                "transaction_id": "da8714b0c1b111eb9cfa9fbb764c67fa"
            }
        ],
        "nonce": 16986,
        "hash": "00000ab48e0c30127ffbdd078747f00c9afc2fe7ca535c59dbd45b2f44ddf8ad",
        "previous_block_hash": "00005e2e79e62664ce1eff5c5dd523083715433b61d45dc7cacbade3cba8ae25"
    },
    {
        "index": 5,
        "timestamp": 1622425530496,
        "transactions": [
            {
                "amount": 6.25,
                "sender": "00",
                "recipient": "5a963e20c1b111eb9cfa9fbb764c67fa",
                "transaction_id": "e09efca0c1b111eb9cfa9fbb764c67fa"
            }
        ],
        "nonce": 70781,
        "hash": "0000205fb6e72baf5e528d2fb5f1daed89a0f5840984200a4656e83e08393e58",
        "previous_block_hash": "00000ab48e0c30127ffbdd078747f00c9afc2fe7ca535c59dbd45b2f44ddf8ad"
    }
];

console.log('VALID: ', bitcoin.chainIsValid(blockchain1));