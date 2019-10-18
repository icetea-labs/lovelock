const keythereum = require('keythereum');
const { getAccount } = require('@iceteachain/common/src/utils');

function decode(password, keyObject) {
  const privateKey = keythereum.recover(password, keyObject);
  const account = getAccount(privateKey);
  return account;
}
function decodeTx(password, keyObject, encode) {
  let data = keythereum.recover(password, keyObject);
  if (!encode) data = new TextDecoder('utf-8').decode(data).replace(/%20/g, ' ');
  return data;
}

export { decodeTx, decode };
export default decode;
