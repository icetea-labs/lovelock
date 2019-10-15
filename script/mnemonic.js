const bip39 = require('bip39')
const HDKey = require('hdkey')
const { codec, ecc } = require('@iceteachain/common')

exports.toPkey = mnemonic => {
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Wrong mnemonic format.');
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed).derive('m’/44’/349’/0’/0')

    let pkey, found
    for (let i = 0; !found; i++) {
        if (i > 100) {
            // there must be something wrong, because the ratio of regular account is 50%
            throw new Error('Too many tries deriving regular account from seed.')
        }
        pkey = hdkey.deriveChild(i)
        const { address } = ecc.toPubKeyAndAddress(privateKey)
        found = codec.isRegularAddress(address)
    }

    return pkey
}
