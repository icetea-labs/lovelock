const keythereum = require('keythereum');
const { getAccount } = require('@iceteachain/common/src/utils');

function decode(password, keyObject) {
  const privateKey = keythereum.recover(password, keyObject);
  const account = getAccount(privateKey);
  return account;
}
function decodeTx(password, keyObject) {
  const data = keythereum.recover(password, keyObject);
  return data;
}
export { decodeTx, decode };
export default decode;
