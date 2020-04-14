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
  getMemoriesByListMemIndex: async (arrayMem, page = false, pageSize = false, loadToCurrentPage = false) => {
    const memoryData = await callView('getMemoriesByListMemIndex', [arrayMem, page, pageSize, loadToCurrentPage]);
    return addInfoToMems(memoryData);
  },
  getLocksForFeed: async (address, includeFollowing = false, includeMemoryIndexes = false) => {
    const lockForFeed = await callView('getLocksForFeed', [address, includeFollowing, includeMemoryIndexes]);
    return lockForFeed;
  },
  getDetailLock: async (index, includeRecentData = false) => {
    const lock = await callView('getDetailLock', [index, includeRecentData]);
    const proInfo = lock[0] || {};

    // add basic extra info
    proInfo.index = index;
    proInfo.coverImg = proInfo.coverImg;
    proInfo.isJournal = !proInfo.receiver || (proInfo.sender === proInfo.receiver);
    proInfo.isCrush = proInfo.receiver === process.env.REACT_APP_BOT_LOVER;
    proInfo.isCouple = !proInfo.isJournal && !proInfo.isCrush;

    return proInfo;
  },
  getMemoriesByLockIndex: async (lockIndex, validCollectionId, page, pageSize, loadToCurrentPage) => {
    const memoryData = await callView('getMemoriesByLockIndex', [lockIndex, validCollectionId, page, pageSize, loadToCurrentPage]);
    return addInfoToMems(memoryData, true);
  },
  getChoiceMemories: async (extra, page, pageSize, loadToCurrentPage) => {
    const memoryData = await callView('getChoiceMemories', [extra, page, pageSize, loadToCurrentPage]);
    return addInfoToMems(memoryData);
  },
  getUserByAdd: async address => {
    const userByAdd = await callView('getUserByAdd', [address]);
    return userByAdd;
  },
};

export default APIService;
