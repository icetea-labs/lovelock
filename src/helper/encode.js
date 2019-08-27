const keythereum = require('keythereum');
const { codec } = require('@iceteachain/common');

/**
 * @privateKey
 * @password
 */
function encode(privateKey, password) {
  const options = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: {
      c: 262144,
      dklen: 32,
      prf: 'hmac-sha256',
    },
  };

  const dk = keythereum.create();
  return keythereum.dump(password, codec.toBuffer(privateKey), dk.salt, dk.iv, options);
}

export default encode;
