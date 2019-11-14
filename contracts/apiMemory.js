exports.apiCreateMemory = (self, lockIndex, isPrivate, content, info = {}, opts = []) => {
  return _addMemory(self, lockIndex, isPrivate, content, info, [...opts]);
};
exports.apiLikeMemory = (self, memoIndex, type) => {
  const sender = msg.sender;
  const [memo, memories] = self.getMemory(memoIndex);

  if (memo.likes[sender]) {
    delete memo.likes[sender];
  } else {
    memo.likes[sender] = { type };
  }
  // save the memeory
  self.setMemories(memories);
  const eventName = 'addLike_' + memoIndex;
  self.emitEvent(eventName, { by: msg.sender, memoIndex, type }, ['by', 'memoIndex']);

  return memo.likes || [];
};
exports.apiCommentMemory = (self, memoIndex, content, info) => {
  const sender = msg.sender;
  const [memo, memories] = self.getMemory(memoIndex);
  const newblock = block;
  const timestamp = Date.now();
  const comment = { sender, content, info, timestamp, newblock };
  memo.comments.push(comment);

  // save memories
  self.setMemories(memories);
};

function _addMemory(self, lockIndex, isPrivate, content, info, [isFirstMemory, pro, proposes] = []) {
  if (info.date == null) {
    info.date = block.timestamp;
  } else {
    if (typeof info.date !== 'number' || !Number.isInteger(info.date) || info.date < 0) {
      throw new Error('info.date must be a timestamp (integer).');
    }
  }

  if (!pro || !proposes) {
    [pro, proposes] = self.getPropose(lockIndex);
  }

  expectProposeOwners(pro, 'Cannot add memory');
  const sender = msg.sender;
  const memory = { isPrivate, sender, lockIndex, content, info, type: isFirstMemory ? 1 : 0, likes: {}, comments: [] };

  //new memories
  if (sender === pro.sender) {
    memory.receiver = pro.receiver;
  } else {
    memory.receiver = pro.sender;
  }

  const memories = self.getMemories();
  const memIndex = memories.push(memory) - 1;
  self.setMemories(memories);
  pro.memoIndex.push(memIndex);

  if (isFirstMemory) {
    pro.memoryRelationIndex = memIndex;
  }

  // save the proposes
  self.setProposes(proposes);

  //emit Event
  const log = { ...memory, id: memIndex };
  self.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
  return memIndex;
}
// ========== GET DATA ==================
exports.apiGetMemoriesByLock = (self, lockIndex, collectionId) => {
  // const memoryPro = self.getP2m()[proIndex] || [];
  const memoryPro = getDataByIndex(self.getProposes(), lockIndex)['memoIndex'];

  const memories = self.getMemories();
  return memoryPro.reduce((res, index) => {
    const mem = getDataByIndex(memories, index);
    if (collectionId == null || isNaN(collectionId) || mem.info.collectionId === collectionId) {
      res.push({ ...mem, id: index });
    }
    return res;
  }, []);
};
exports.apiGetMemoriesByRange = (self, start, end) => {
  const allMem = self.getMemories();
  let i = 0;
  let res = [];

  if (end > allMem.length) end = allMem.length;
  for (i = start; i < end; i++) {
    if (!allMem[i].isPrivate) {
      res.push({ ...allMem[i], id: i });
    }
  }
  return res;
};
exports.apiGetMemoriesByListMemIndex = (self, listMemIndex) => {
  const allMem = self.getMemories();
  return _addInfoToMems(allMem, listMemIndex, self);
};
function _addInfoToMems(mems, listMemIndex, self) {
  const ctDid = loadContract('system.did');
  let res = [];
  listMemIndex.forEach(index => {
    let mem = mems[index];
    let tmp = {};
    tmp.s_tags = ctDid.query.invokeView(mem.sender).tags || {};
    tmp.name = tmp.s_tags['display-name']; // tmp
    tmp.pubkey = tmp.s_tags['pub-key']; // tmp
    //LOCK_TYPE_JOURNAL
    if (mem.receiver === mem.sender) {
      tmp.r_tags = {};
    } else if (mem.receiver === self.botAddress) {
      let lock = getDataByIndex(self.getProposes(), mem.lockIndex);
      lock.bot_info.avatar = lock.bot_info.botAva;
      lock.bot_info['display-name'] = `${lock.bot_info.firstname} ${lock.bot_info.lastname}`;
      tmp.r_tags = lock.bot_info;
    } else {
      tmp.r_tags = ctDid.query.invokeView(mem.receiver).tags || {};
    }
    res.push({ ...mem, id: index, ...tmp });
  });
  // sort descending by mem id;
  res = res.sort((a, b) => {
    return b.id - a.id;
  });
  return res;
}
