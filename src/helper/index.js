import tweb3 from "../service/tweb3";

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

export async function sendTransaction(func) {
  const { address } = this.props;
  const { answers, loading, params_value, account } = this.state;
  const signers = account.address;
  // console.log('params_value', params_value);
  try {
    const ct = tweb3.contract(address);
    const result = await ct.methods[func.name](
      ...(params_value[func.name] || [])
    ).sendCommit({ signers });
    answers[func.name] = formatResult(result);
  } catch (error) {
    console.log(error);
    answers[func.name] = formatResult(error, true);
  } finally {
    loading[func.name] = false;
    this.setState({ answers, loading });
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
