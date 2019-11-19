import { callView, getJsonFromIpfs } from '../helper';

async function addInfoToMems(memorydata, isDetailScreen = false) {
  const newMems = [];
  for (let i = 0; i < memorydata.length; i++) {
    const mem = memorydata[i];
    if (mem.isPrivate) {
      mem.isUnlock = false;
    } else {
      mem.isUnlock = true;
    }
    for (let j = 0; j < mem.info.hash.length; j++) {
      // eslint-disable-next-line no-await-in-loop
      mem.info.hash[j] = await getJsonFromIpfs(mem.info.hash[j], j);
    }
    mem.isDetailScreen = isDetailScreen;
    newMems.push(mem);
  }
  return newMems;
}

const APIService = {
  getMemoriesByListMemIndex: async arrayMem => {
    const memorydata = await callView('getMemoriesByListMemIndex', [arrayMem]);
    return addInfoToMems(memorydata);
  },
  getLocksForFeed: async address => {
    const lockForFeed = await callView('getLocksForFeed', [address]);
    return lockForFeed;
  },
  getDetailLock: async index => {
    const propose = await callView('getDetailLock', [index]);
    const proInfo = propose[0] || {};

    // add basic extra info
    proInfo.index = index;
    proInfo.coverImg = proInfo.coverImg || 'QmXtwtitd7ouUKJfmfXXcmsUhq2nGv98nxnw2reYg4yncM';
    proInfo.isJournal = proInfo.sender === proInfo.receiver;
    proInfo.isCrush = proInfo.receiver === process.env.REACT_APP_BOT_LOVER;
    proInfo.isCouple = !proInfo.isJournal && !proInfo.isCrush;

    return proInfo;
  },
  getMemoriesByProIndex: async (lockIndex, validCollectionId) => {
    const memorydata = await callView('getMemoriesByProIndex', [lockIndex, validCollectionId]);
    return addInfoToMems(memorydata, true);
  },
};

export default APIService;
