const LOCK_STATUS_PENDING = 0;
const LOCK_STATUS_ACCEPTED = 1;
const LOCK_STATUS_DENIED = 2;

const LOCK_TYPE_COUPLE = 0;
const LOCK_TYPE_CRUSH = 1;
const LOCK_TYPE_JOURNAL = 2;

exports.apiCreateLock = (self, s_content, receiver, s_info = {}, bot_info) => {
  // cache some variables
  const sender = msg.sender;
  const isPrivate = false;
  const isJournal = sender === receiver;
  const isCrush = receiver === self.botAddress;

  // validate data

  if (!isCrush) {
    expect(bot_info == null, 'bot_info must be null for a regular lock.');
  } else {
    bot_info = validate(
      bot_info,
      Joi.object({
        firstname: Joi.string(),
        lastname: Joi.string(),
        botAva: Joi.string(),
        botReply: Joi.string().required(),
      })
        .label('bot_info')
        .required()
        .or('firstname', 'lastname')
    );
  }

  s_info = validate(
    s_info,
    Joi.object({
      hash: Joi.array()
        .min(0)
        .max(1)
        .items(Joi.string()),
      date: Joi.date()
        .timestamp()
        .raw(),
    })
  );
  s_info.date = s_info.date ?? block.timestamp;

  let pendingLock = {};
  if (isCrush) {
    pendingLock = { status: LOCK_STATUS_ACCEPTED, type: LOCK_TYPE_CRUSH };
  } else if (isJournal) {
    pendingLock = { status: LOCK_STATUS_ACCEPTED, type: LOCK_TYPE_JOURNAL };
  } else {
    pendingLock = { status: LOCK_STATUS_PENDING, type: LOCK_TYPE_COUPLE };
  }

  pendingLock = {
    coverImg: s_info.hash?.[0] ?? '',
    isPrivate,
    sender,
    s_content,
    s_info: { date: s_info.date }, // no need hash
    receiver,
    r_content: '',
    r_info: '',
    memoIndex: [],
    follows: [],
    contributors: [],
    bot_info,
    memoryRelationIndex: '',
    ...pendingLock,
  };

  //new pending lock
  const locks = self.getLocks();
  const index = locks.push(pendingLock) - 1;
  self.setLocks(locks);

  // create the first memory for auto-accepted lock
  if (pendingLock.status === LOCK_STATUS_ACCEPTED) {
    apiCreateMemory(self, index, false, '', { hash: [] }, [true]);
  }

  // map address to lock
  const a2p = self.getA2p();
  if (!a2p[sender]) a2p[sender] = [];
  a2p[sender].push(index);

  if (!isJournal && !isCrush) {
    if (!a2p[receiver]) a2p[receiver] = [];
    a2p[receiver].push(index);
  }
  self.setA2p(a2p);
  //emit Event
  const log = { ...pendingLock, id: index };
  self.emitEvent('createLock', { by: sender, log }, ['by']);
  return index;
};
exports.apiAcceptLock = (self, lockIndex, r_content) => {
  const ret = _confirmLock(self, lockIndex, r_content, LOCK_STATUS_ACCEPTED);
  apiCreateMemory(self, lockIndex, false, '', { hash: [] }, [true, ...ret]);
};
exports.apiCancelLock = (self, lockIndex, r_content) => {
  _confirmLock(self, lockIndex, r_content, LOCK_STATUS_DENIED, true);
};
exports.apiLikeLock = (self, lockIndex, type) => {
  const sender = msg.sender;

  const [lock, locks] = self.getLock(lockIndex);
  if (lock.likes[sender]) {
    delete lock.likes[sender];
  } else {
    lock.likes[sender] = { type };
  }
  // save locks
  self.setLocks(locks);

  return lock.likes || [];
};
exports.apiChangeLockImg = (self, index, imgHash) => {
  const [lock, locks] = self.getLock(index);
  const sender = msg.sender;
  expect(sender === lock.receiver || sender === lock.sender, 'Permission deny. Can not change.');

  lock.coverImg = imgHash;
  // save locks
  self.setLocks(locks);
  //emit Event
  const log = { ...lock, id: index };
  self.emitEvent('changeCoverImg', { by: sender, log }, ['by']);
};
exports.apiFollowLock = (self, lockIndex) => {
  const sender = msg.sender;
  const [lock, locks] = self.getLock(lockIndex);
  const afl = self.getAFL();
  if (!afl[sender]) afl[sender] = [];
  const index = lock.follows.indexOf(sender);
  if (index !== -1) {
    // unfollowLock
    lock.follows.splice(index, 1);
    afl[sender].splice(afl[sender].indexOf(lockIndex), 1);
  } else {
    //  followLock
    lock.follows.push(sender);
    afl[sender].push(lockIndex);
  }
  // set map address follow lock
  self.setAFL(afl);

  // save locks
  self.setLocks(locks);
  return sender;
};
exports.apiAddContributorsToLock = (self, lockIndex, contributors) => {
  const [lock, locks] = self.getLock(lockIndex);
  expect(lock.type === LOCK_TYPE_JOURNAL, 'Only support Journal.');
  expectLockOwners(lock);
  const Schema = Joi.array().items(
    Joi.string()
      .max(43)
      .min(43)
  );
  contributors = validate(contributors, Schema);
  contributors = contributors.filter(addr => {
    return lock.contributors.indexOf(addr) === -1;
  });
  lock.contributors = lock.contributors.concat(contributors);
  // add follow lock
  const afl = self.getAFL();
  contributors.forEach(addr => {
    const index = lock.follows.indexOf(addr);
    if (index === -1) {
      //  followLock
      lock.follows.push(addr);
      afl[addr].push(lockIndex);
    }
  });
  self.setAFL(afl);
  // save locks
  self.setLocks(locks);
  return contributors;
};
exports.apiRemoveContributorsToLock = (self, lockIndex, contributors) => {
  const [lock, locks] = self.getLock(lockIndex);
  expectLockOwners(lock);
  lock.contributors = lock.contributors.filter(addr => {
    return contributors.indexOf(addr) === -1;
  });
  // save locks
  self.setLocks(locks);
  return contributors;
};
//private function
function _confirmLock(self, index, r_content, status, saveFlag) {
  const sender = msg.sender;
  const [lock, locks] = self.getLock(index);
  // status: pending: 0, accept_lock: 1, cancel_lock: 2
  switch (status) {
    case LOCK_STATUS_ACCEPTED:
      expect(sender === lock.receiver, "Can't accept lock. You must be receiver.");
      break;
    case LOCK_STATUS_DENIED:
      expectLockOwners(lock, "You can't cancel lock.");
      break;
  }
  Object.assign(lock, { r_content, status });

  if (saveFlag) {
    self.setLocks(locks);
  }

  //emit Event
  const log = { ...lock, id: index };
  self.emitEvent('confirmLock', { by: sender, log }, ['by']);

  return [lock, locks];
}

// ========== GET DATA ==================
exports.apiGetLocksByAddress = (self, addr) => {
  const locks = self.getLocks();
  const locksIndex = self.getA2p()[addr] || [];
  return _prepareData(locks, locksIndex);
};
exports.apiGetFollowingLocksByAddress = (self, addr) => {
  const locks = self.getLocks();
  const locksIndex = self.getAFL()[addr] || [];
  return _prepareData(locks, locksIndex);
};
exports.apiGetFollowingPersionLocksByAddress = (self, addr) => {
  const followingAddr = self.getFollowing()[addr] || [];
  let resp = followingAddr.reduce((res, addr) => {
    let lock = exports.apiGetLocksByAddress(self, addr);
    res = res.concat(lock);
    return res;
  }, []);
  resp = Array.from(new Set(resp.map(JSON.stringify))).map(JSON.parse);
  return resp;
};
exports.apiGetDataForMypage = (self, address) => {
  const ctDid = loadContract('system.did');
  const ctAlias = loadContract('system.alias');
  const alias = ctAlias.byAddress.invokeView(address) || '';
  const tags = ctDid.query.invokeView(address).tags || {};

  let myData = {};
  myData.avatar = tags.avatar;
  myData['display-name'] = tags['display-name'] || '';
  myData.username = alias.replace('account.', '');
  myData.followed = self.getFollowed()[address] || [];
  return [myData];
};
function _prepareData(locks, locksIndex) {
  let resp = [];
  locksIndex.forEach(index => {
    let lock = getDataByIndex(locks, index);
    lock = Object.assign({}, lock, { id: index });
    resp.push(lock);
  });
  resp = Array.from(new Set(resp.map(JSON.stringify))).map(JSON.parse);
  return resp;
}
// exports.apiGetLockByIndex = (self, index) => {
//   const [lock] = self.getLock(index);
//   // let resp = [];
//   // if (lock && lock.isPrivate) {
//   //   expectLockOwners(lock, "Can't get lock.");
//   // }
//   const newLock = _addTopInfoToLocks([lock], [lock.id]);
//   // resp.push(newLock[0]);
//   return newLock;
// };
exports.apiGetDetailLock = (self, index) => {
  const [lock] = self.getLock(index);
  const newLock = _addTopInfoToLocks([lock]);
  return newLock;
};
exports.apiGetLocksForFeed = (self, addr) => {
  let resp = [];
  const ownerLocks = exports.apiGetLocksByAddress(self, addr);
  const followLocks = exports.apiGetFollowingLocksByAddress(self, addr);
  const followPersionLocks = exports.apiGetFollowingPersionLocksByAddress(self, addr);
  // get locks ID
  const ownerLocksId = ownerLocks.map(lock => lock.id);
  const followLocksId = followLocks
    .map(lock => lock.id)
    .filter(id => {
      return ownerLocksId.indexOf(id) === -1;
    });
  const followPersionLocksId = followPersionLocks
    .map(lock => lock.id)
    .filter(id => {
      return ownerLocksId.indexOf(id) === -1;
    });

  resp = ownerLocks.concat(followLocks).concat(followPersionLocks);
  // remove duplicate locks
  resp = Array.from(new Set(resp.map(JSON.stringify))).map(JSON.parse);
  // get more info from system.did, system.alias
  resp = _addLeftInfoToLocks(resp, ownerLocksId);

  return { locks: resp, ownerLocksId, followLocksId, followPersionLocksId };
};

function _addLeftInfoToLocks(locks, ownerLocksId = []) {
  const ctDid = loadContract('system.did');
  const ctAlias = loadContract('system.alias');
  let resp = [];
  locks.forEach(lock => {
    let tmp = {};
    if (lock.type === LOCK_TYPE_JOURNAL) {
      tmp.s_tags = ctDid.query.invokeView(lock.sender).tags || {};
    } else if (lock.type === LOCK_TYPE_CRUSH) {
      const tmpBotInfo = {};
      tmpBotInfo.avatar = lock.bot_info.botAva;
      tmpBotInfo['display-name'] = `${lock.bot_info.firstname} ${lock.bot_info.lastname}`;
      tmp.bot_info = { ...lock.bot_info, ...tmpBotInfo };
    } else {
      tmp.s_tags = ctDid.query.invokeView(lock.sender).tags || {};
      tmp.r_tags = ctDid.query.invokeView(lock.receiver).tags || {};

      const s_alias = ctAlias.byAddress.invokeView(lock.sender);
      tmp.s_alias = (s_alias || '').replace('account.', '');
      const r_alias = ctAlias.byAddress.invokeView(lock.receiver);
      tmp.r_alias = (r_alias || '').replace('account.', '');
    }
    if (ownerLocksId.indexOf(lock.id) !== -1) {
      tmp.isMyLocks = true;
    } else {
      tmp.isMyLocks = false;
    }
    resp.push({ ...lock, ...tmp });
  });
  return resp;
}

function _addTopInfoToLocks(locks) {
  const ctDid = loadContract('system.did');
  let resp = [];
  locks.forEach(lock => {
    let tmp = {};
    const s_tags = ctDid.query.invokeView(lock.sender).tags || {};
    tmp.s_name = s_tags['display-name'];
    tmp.s_avatar = s_tags.avatar;
    tmp.s_date = lock.s_info.date;
    if (lock.type === LOCK_TYPE_CRUSH) {
      tmp.r_name = `${lock.bot_info.firstname} ${lock.bot_info.lastname}`;
      tmp.r_avatar = lock.bot_info.botAva;
      tmp.r_content = lock.bot_info.botReply;
    } else {
      const r_tags = ctDid.query.invokeView(lock.receiver).tags || {};
      tmp.r_name = r_tags['display-name'];
      tmp.r_avatar = r_tags.avatar;
      tmp.r_publicKey = r_tags['pub-key'] || '';
    }
    resp.push({ ...lock, ...tmp });
  });
  return resp;
}

// ========== DELETE DATA ==================
exports.apiDeleteLock = (self, lockIndex) => {
  const sender = msg.sender;
  const [lock, locks] = self.getLock(lockIndex);

  expect(owner.includes(sender), 'You must be in admin group.');

  // save memories
  self.getLocks(memories);
};
