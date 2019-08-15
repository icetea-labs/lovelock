import { IceteaWeb3 } from "@iceteachain/web3";
const tweb3 = new IceteaWeb3(process.env.rpc);
tweb3.wallet.importAccount(process.env.privateKey1);
tweb3.wallet.importAccount(process.env.privateKey2);
tweb3.wallet.defaultAccount = process.env.address2;
export default tweb3;
