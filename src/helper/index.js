import tweb3 from "../service/tweb3";

export async function callPure(funcName, params) {
  callReadOrPure(funcName, params, "callPureContractMethod");
}
export async function callView(funcName, params) {
  callReadOrPure(funcName, params, "callReadonlyContractMethod");
}
async function callReadOrPure(funcName, params, method) {
  const address = process.env.REACT_APP_CONTRACT;

  try {
    const result = await tweb3[method](address, funcName, params || []);
    return tryStringifyJson(result || "" + result);
  } catch (error) {
    console.log(tryStringifyJson(error, true));
  }
}

export async function sendTransaction(func, index) {
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
