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
  const timestamp = Date.now();

  const comment = { sender, content, info, timestamp };
  memo.comments.push(comment);

  // save memories
  self.setMemories(memories);
};

function _addMemory(self, lockIndex, isPrivate, content, info, [isFirstMemory, lock, locks] = []) {
  if (info.date == null) {
    info.date = block.timestamp;
  } else {
    if (typeof info.date !== 'number' || !Number.isInteger(info.date) || info.date < 0) {
      throw new Error('info.date must be a timestamp (integer).');
    }
  }

  if (!lock || !locks) {
    [lock, locks] = self.getLock(lockIndex);
  }

  expectLockOwners(lock, 'Cannot add memory');
  const sender = msg.sender;
  const memory = { isPrivate, sender, lockIndex, content, info, type: isFirstMemory ? 1 : 0, likes: {}, comments: [] };

  //new memories
  if (sender === lock.sender) {
    memory.receiver = lock.receiver;
  } else {
    memory.receiver = lock.sender;
  }

  const memories = self.getMemories();
  const memIndex = memories.push(memory) - 1;
  self.setMemories(memories);
  lock.memoIndex.push(memIndex);

  if (isFirstMemory) {
    lock.memoryRelationIndex = memIndex;
  }

  // save the locks
  self.setLocks(locks);

  //emit Event
  const log = { ...memory, id: memIndex };
  self.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
  return memIndex;
}
// ========== GET DATA ==================
exports.apiGetMemoriesByLock = (self, lockIndex, collectionId) => {
  // const memoryPro = self.getP2m()[proIndex] || [];
  const memoryPro = getDataByIndex(self.getLocks(), lockIndex)['memoIndex'];
  const memories = self.getMemories();

  let resp = memoryPro.reduce((res, index) => {
    let mem = getDataByIndex(memories, index);
    if (collectionId == null || isNaN(collectionId) || mem.info.collectionId === collectionId) {
      res.push({ ...mem, id: index });
    }
    return res;
  }, []);

  resp = _addInfoToMems(resp, self);
  return resp;
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
  const memories = self.getMemories();

  const mems = listMemIndex.map(index => {
    return { ...getDataByIndex(memories, index), id: index };
  });
  return _addInfoToMems(mems, self);
};

function _addInfoToMems(memories, self) {
  const ctDid = loadContract('system.did');

  let res = memories.map(mem => {
    let tmpMem = {};
    tmpMem.s_tags = ctDid.query.invokeView(mem.sender).tags || {};
    tmpMem.name = tmpMem.s_tags['display-name']; // tmpMem
    tmpMem.pubkey = tmpMem.s_tags['pub-key']; // tmpMem
    //LOCK_TYPE_JOURNAL
    if (mem.receiver === mem.sender) {
      tmpMem.r_tags = {};
    } else if (mem.receiver === self.botAddress) {
      let lock = getDataByIndex(self.getLocks(), mem.lockIndex);
      const tmpBotInfo = {};
      tmpBotInfo.avatar = lock.bot_info.botAva;
      tmpBotInfo['display-name'] = `${lock.bot_info.firstname} ${lock.bot_info.lastname}`;
      tmpMem.r_tags = { ...tmpBotInfo, ...lock.bot_info };
    } else {
      tmpMem.r_tags = ctDid.query.invokeView(mem.receiver).tags || {};
    }
    return { ...mem, ...tmpMem };
  }, []);

  // sort descending by mem id;
  res = res.sort((a, b) => {
    return b.id - a.id;
  });
  return res;
}
// ========== DELETE DATA ==================
exports.apiDeleteMemory = (self, memIndex) => {
  const sender = msg.sender;
  const owner = self.getOnwer();
  expect(owner.includes(sender), 'You must be in admin group.');
  let [mem, mems] = self.getMemory(memIndex);
  // remove memoIndex in lock
  const locks = self.getLocks();
  const { lockIndex } = mem;
  locks[lockIndex].memoIndex.splice(locks[lockIndex].memoIndex.indexOf(memIndex), 1);
  // save locks
  self.setLocks(locks);
  // delete mem
  mems[memIndex] = { deletedBy: sender };
  // save memories
  self.setMemories(mems);
  return memIndex;
};

exports.apiDeleteComment = (self, memoIndex, cmtNo) => {
  const sender = msg.sender;
  const [memo, memories] = self.getMemory(memoIndex);

  const comments = self.getMemory(memoIndex)[0].comments;
  const owner = [comments[cmtNo].sender, memo.sender, memo.receiver, ...self.getAdmins()];

  expect(owner.includes(sender), "Can't delete comment. You must be owner.");

  // delete comments.cmtNo;
  const newCmt = comments.splice(cmtNo, 1);

  // const log = { ...newCmt };
  // self.emitEvent('deleteComment', { by: msg.sender, log }, ['by']);

  // save memories
  self.setMemories(memories);
};
