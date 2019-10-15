const bip39 = require('bip39')
const HDKey = require('hdkey')
const { codec, ecc } = require('@iceteachain/common')

const path = 'm’/44’/349’/0’/0'

const getPkey = (mnemonic, index) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    return hdkey.derive(path + index);
}

exports.toPkey = seed => {
    if (!bip39.validateMnemonic(seed)) {
        throw new Error('Wrong mnemonic format.');
    }

    let index = 0, address, pkey

    do {
        pkey = getPkey(seed, index);
        address = ecc.toPubKeyAndAddress(privateKey).address
        index++
    } while (!codec.isRegularAddress(address));

    return pkey

}
