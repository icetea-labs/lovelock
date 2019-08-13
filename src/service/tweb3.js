import { IceteaWeb3 } from "@iceteachain/web3";

export default (window.tweb3 = new IceteaWeb3(process.env.REACT_APP_RPC));
