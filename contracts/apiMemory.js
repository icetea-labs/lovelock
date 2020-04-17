exports.apiCreateMemory = (self, lockIndex, isPrivate, content, info = {}, opts = []) => {
  return _addMemory(self, lockIndex, isPrivate, content, info, opts);
};

exports.apiLikeMemory = (self, memoIndex, type) => {
  const sender = msg.sender;
  const [memo, memories] = self.getMemory(memoIndex);
  const timestamp = Date.now();
  let isLike = false;

  if (memo.likes[sender]) {
    delete memo.likes[sender];
  } else {
    memo.likes[sender] = { type };
    isLike = true;
  }
  // save the memeory
  self.setMemories(memories);
  // const eventName = 'addLike' + memoIndex;
  self.emitEvent(
    'addLike',
    { by: msg.sender, log: { id: memoIndex, isLike, type, timestamp, sender: memo.sender, receiver: memo.receiver } },
    ['by']
  );

  return memo;
};

exports.apiCommentMemory = (self, memoIndex, content, info) => {
  const sender = msg.sender;
  const [memo, memories] = self.getMemory(memoIndex);
  const timestamp = Date.now();

  const comment = { sender, content, info, timestamp };
  memo.comments.push(comment);

  // save memories
  self.setMemories(memories);
  const log = { ...comment, id: memoIndex, sender: memo.sender, receiver: memo.receiver };
  self.emitEvent('addComment', { by: msg.sender, log }, ['by']);

  return memo;
};

// ========== GET DATA ==================
exports.apiGetMemoriesByLock = (self, lockIndex, collectionId, page, pageSize, loadToCurrentPage) => {
  const locks = self.getLocks();
  const memoryPro = getDataByIndex(locks, lockIndex)['memoIndex'];
  const memories = self.getMemories();

  let resp = memoryPro.reduce((res, index) => {
    let mem = getDataByIndex(memories, index);
    if (collectionId == null || isNaN(collectionId) || mem.info.collectionId === collectionId) {
      res.push({ ...mem, id: index });
    }
    return res;
  }, []);

  resp = _getPaginatedMemories(resp, page, pageSize, loadToCurrentPage);

  return _addInfoToMems(resp, self, locks);
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

exports.apiGetMemoriesByListMemIndex = (self, listMemIndex, page, pageSize, loadToCurrentPage) => {
  const memories = self.getMemories();

  // remove duplicate
  listMemIndex = [...new Set(listMemIndex)];

  let mems = listMemIndex.map(index => {
    return { ...getDataByIndex(memories, index), id: index };
  });

  if (page !== false) {
    mems = _getPaginatedMemories(mems, page, pageSize, loadToCurrentPage);
  }

  return _addInfoToMems(mems, self);
};

exports.apiEditMemory = (self, memIndex, content, info) => {
  const [mem, mems] = self.getMemory(memIndex);

  expect(msg.sender === mem.sender, 'Only author can edit memory.');

  if (content != null) {
    expect(typeof content === 'string', 'Type of content must be string.');
    mem.content = content;
  }

  if (info != null) {
    const { hash, date, collectionId } = info;
    if (hash != null) {
      expect(Array.isArray(hash), 'info.hash must be an array.');
      hash.forEach(h => {
        if (typeof h !== 'string') {
          throw new Error('info.hash members must be strings.');
        }
      });

      mem.info.hash = hash;
    }

    if (date != null) {
      expect(typeof date === 'number' && date > 0 && Number.isInteger(date), 'info.date must be a valid timestamp.');
      mem.info.date = date;
    }

    if (collectionId != null) {
      expect(
        typeof collectionId === 'number' && collectionId >= 0 && Number.isInteger(collectionId),
        'info.collectionId must be a valid number.'
      );
      mem.info.collectionId = collectionId;
    }
  }

  // save memories
  self.setMemories(mems);

  return mem;
};

// ========== DELETE DATA ==================
exports.apiDeleteMemory = (self, memIndex) => {
  const sender = msg.sender;
  const [mem, mems] = self.getMemory(memIndex);

  // remove memoIndex in lock
  const locks = self.getLocks();
  const lockIndex = mem.lockIndex;

  const lock = locks[lockIndex];
  const owners = [mem.sender, lock.sender, lock.receiver];
  expect(
    owners.includes(sender) || self.getAdmins().includes(sender),
    'Only post author or lock owners can delete this post.'
  );
  expect(lock.memoryRelationIndex !== memIndex, 'Cannot delete initial memory.');

  lock.memoIndex.splice(lock.memoIndex.indexOf(memIndex), 1);
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

  const comments = memo.comments;
  const owners = [comments[cmtNo].sender, memo.sender, memo.receiver];

  expect(owners.includes(sender) || self.getAdmins().includes(sender), 'You cannot delete this comment.');

  // delete comments.cmtNo;
  comments.splice(cmtNo, 1);

  // const log = { ...newCmt };
  // self.emitEvent('deleteComment', { by: msg.sender, log }, ['by']);

  // save memories
  self.setMemories(memories);
};

function _addInfoToMems(memories, self, locks) {
  const ctDid = loadContract('system.did');
  locks = locks || self.getLocks();
  let res = memories.map(mem => {
    let tmpMem = {};
    tmpMem.s_tags = ctDid.query.invokeView(mem.sender).tags || {};
    tmpMem.name = tmpMem.s_tags['display-name']; // tmpMem
    tmpMem.pubkey = tmpMem.s_tags['pub-key']; // tmpMem
    //LOCK_TYPE_JOURNAL
    let lock = getDataByIndex(locks, mem.lockIndex);
    if (mem.receiver === mem.sender) {
      tmpMem.r_tags = {};
    } else if (mem.receiver === self.botAddress) {
      const tmpBotInfo = {};
      tmpBotInfo.avatar = lock.bot_info.botAva;
      tmpBotInfo['display-name'] = `${lock.bot_info.firstname} ${lock.bot_info.lastname}`;
      tmpMem.r_tags = { ...tmpBotInfo, ...lock.bot_info };
    } else {
      tmpMem.r_tags = ctDid.query.invokeView(mem.receiver).tags || {};
    }
    return { ...mem, ...tmpMem, lock };
  }, []);

  // sort descending by mem id;
  res = res.sort((a, b) => {
    return b.id - a.id;
  });
  return res;
}

function _addMemory(self, lockIndex, isPrivate, content, info, [isFirstMemory, lock, locks, lockSender] = []) {
  if (info.date == null) {
    info = { ...info, date: block.timestamp };
  } else {
    if (typeof info.date !== 'number' || !Number.isInteger(info.date) || info.date < 0) {
      throw new Error('info.date must be a timestamp (integer).');
    }
  }

  if (!lock || !locks) {
    [lock, locks] = self.getLock(lockIndex);
  }

  expect(lock.status === 1, 'Cannot add memory to a pending lock.');
  !lockSender && expectLockContributors(lock, 'Only lock contributors can add memory.');
  const sender = lockSender || msg.sender;
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

function _getPaginatedMemories(memories, page, pageSize, loadToCurrentPage) {
  if (!memories.length) return [];

  if (page == null || pageSize == null) {
    return memories;
  }

  const sortedMemories = memories.reverse();
  const from = loadToCurrentPage ? 0 : (page - 1) * pageSize;
  const to = page * pageSize;

  return sortedMemories.slice(from, to);
}
