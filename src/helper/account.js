import { getAliasContract, getDidContract, getContract } from '../service/tweb3';

const aliasMethods = getAliasContract().methods;
const didMethods = getDidContract().methods;
const ctMethods = getContract().methods;
const cache = {};

export async function getAlias(address) {
  const item = cache[address] || (cache[address] = {});
  if (item.alias) return item.alias;

  const listAlias = await aliasMethods.byAddress(address).call();
  const alias = Array.isArray(listAlias) ? listAlias[0] : listAlias;

  let shortAlias = '';
  if (alias) {
    shortAlias = alias.replace('account.', '');
    item.alias = shortAlias;
  }
  return shortAlias;
}

export function isAliasRegistered(alias) {
  return aliasMethods.resolve(`account.${alias}`).call();
}

export function registerAlias(username, address) {
  username = username.toLowerCase();
  return aliasMethods
    .register(username, address)
    .sendCommit({ from: address })
    .then(r => {
      const item = cache[address] || (cache[address] = {});
      item.alias = username;
      return r;
    });
}

export function setTagsInfo(tags, opts) {
  const { address } = opts;
  const options = { from: address };
  if (opts.tokenAddress) options.signers = opts.tokenAddress;

  return didMethods
    .setTag(address, tags)
    .sendCommit(options)
    .then(() => {
      const item = cache[address] || (cache[address] = {});
      item.tags = { ...(item.tags || {}), ...tags };
      return item.tags;
    });
}

export async function getTagsInfo(address) {
  const item = cache[address] || (cache[address] = {});
  if (item.tags) return item.tags;
  return didMethods
    .query(address)
    .call()
    .then(({ tags = {} } = {}) => {
      item.tags = tags;
      return tags;
    });
}
export async function isApproved(address) {
  // console.log('address', address, '-', tokenAddress, '-', process.env.REACT_APP_CONTRACT);
  return ctMethods
    .isUserApproved(address)
    .call()
    .then(resp => {
      return resp;
    })
    .catch(() => {
      return false;
    });
}

export function getAliasAndTags(address) {
  return Promise.all([getAlias(address), getTagsInfo(address)]);
}
export function getAuthenAndTags(address) {
  return Promise.all([getTagsInfo(address), isApproved(address)]);
}
