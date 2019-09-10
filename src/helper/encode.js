const keythereum = require('keythereum');
const { codec } = require('@iceteachain/common');

/**
 * @privateKey
 * @password
 */
function encode(privateKey, password, ops) {
  const options = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: {
      c: 262144,
      dklen: 32,
      prf: 'hmac-sha256',
    },
    ...ops,
  };

  const dk = keythereum.create();
  return keythereum.dump(password, codec.toBuffer(privateKey), dk.salt, dk.iv, options);
}
function encodeTx(data, password, ops) {
  const options = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: {
      c: 262144,
      dklen: 32,
      prf: 'hmac-sha256',
    },
    noAddress: true,
  };

  const dk = keythereum.create();
  return keythereum.dump(password, codec.toBuffer(data), dk.salt, dk.iv, options);
}
export { encodeTx, encode };
export default encode;
