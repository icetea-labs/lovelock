import tweb3 from "../service/tweb3";
import ipfs from "../service/ipfs";
import moment from 'moment';

export async function callPure(funcName, params) {
  const resp = await callReadOrPure(funcName, params, "callPureContractMethod");
  if (resp) {
    return JSON.parse(resp);
  } else {
    return [];
  }
}
export async function callView(funcName, params) {
  const resp = await callReadOrPure(
    funcName,
    params,
    "callReadonlyContractMethod"
  );
  if (resp) {
    return JSON.parse(resp);
  } else {
    return [];
  }
}
async function callReadOrPure(funcName, params, method) {
  const address = process.env.contract;

  try {
    const result = await tweb3[method](address, funcName, params || []);
    return tryStringifyJson(result || "" + result);
  } catch (error) {
    console.log(tryStringifyJson(error, true));
  }
}

export async function sendTransaction(funcName, params) {
  // const { address } = this.props;
  console.log("params", params);
  try {
    const ct = tweb3.contract(process.env.contract);
    const result = await ct.methods[funcName](...(params || [])).sendCommit();
    return result;
  } catch (error) {
    console.log(error);
  }
}
export function tryStringifyJson(p, replacer = undefined, space = 2) {
  if (typeof p === "string") {
    return p;
  }
  try {
    return "" + JSON.stringify(p, replacer, space);
  } catch (e) {
    return String(p);
  }
}

export async function getAccountInfo(address) {
  try {
    const info = await tweb3.getAccountInfo(address);
    return info;
  } catch (err) {
    throw err;
  }
}

export async function getTagsInfo(address) {
  const resp = await tweb3
    .contract("system.did")
    .methods.query(address)
    .call();
  if (resp) {
    const { tags } = resp;
    return tags;
  } else {
    return {};
  }
}

export async function saveToIpfs(files) {
  const file = [...files][0];
  let ipfsId;
  const fileDetails = {
    path: file.name,
    content: file
  };
  const options = {
    wrapWithDirectory: true,
    progress: prog => console.log(`received: ${prog}`)
  };
  console.log("fileDetails", fileDetails);
  //ipfs
  //   .add(fileDetails, options)
  //   .then(response => {
  //     console.log(response);
  //     // CID of wrapping directory is returned last
  //     ipfsId = response[response.length - 1].hash;
  //     console.log(ipfsId);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });

  // upload usung file nam
  // const response = await ipfs.add(fileDetails, options);
  // ipfsId = response[response.length - 1].hash;
  // console.log(ipfsId);

  // simple upload
  await ipfs
    .add([...files], { progress: prog => console.log(`received: ${prog}`) })
    .then(response => {
      console.log(response);
      ipfsId = response[0].hash;
      console.log(ipfsId);
    })
    .catch(err => {
      console.error(err);
    });
  return ipfsId;
}

export function TimeWithFormat(props) {
  const formatValue = props.format ? props.format : "MM/DD/YYYY";
  return <span>{moment(props.value).format(formatValue)}</span>;
}
