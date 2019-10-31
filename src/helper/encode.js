const keythereum = require('keythereum');

const iteration = process.env.REACT_APP_KDF_ITERATION || 10000

/**
 * @privateKey
 * @password
 */
function encode(privateKey, password, ops) {
  const options = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: {
      c: iteration,
      dklen: 32,
      prf: 'hmac-sha256',
    },
    noAddress: true,
    ...ops,
  };

  const dk = keythereum.create();
  return keythereum.dump(password, Buffer.from(privateKey), dk.salt, dk.iv, options);
}
function encodeTx(data, password, ops) {
  const options = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: {
      c: 1,
      dklen: 32,
      prf: 'hmac-sha256',
    },
    noAddress: true,
    ...ops,
  };

  const dk = keythereum.create();
  return keythereum.dump(password, Buffer.from(data), dk.salt, dk.iv, options);
}
export { encodeTx, encode };
export default encode;
