import { callView, getJsonFromIpfs } from '../helper';

const APIService = {
  getMemoriesByListMemIndex: async arrayMem => {
    const memorydata = await callView('getMemoriesByListMemIndex', [arrayMem]);
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
      newMems.push(mem);
    }
    return newMems;
  },
  getLocksForFeed: async address => {
    const lockForFeed = await callView('getLocksForFeed', [address]);
    return lockForFeed;
  },
};

export default APIService;
