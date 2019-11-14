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

  let pendingPropose = {};
  if (isCrush) {
    pendingPropose = { status: LOCK_STATUS_ACCEPTED, type: LOCK_TYPE_CRUSH };
  } else if (isJournal) {
    pendingPropose = { status: LOCK_STATUS_ACCEPTED, type: LOCK_TYPE_JOURNAL };
  } else {
    pendingPropose = { status: LOCK_STATUS_PENDING, type: LOCK_TYPE_COUPLE };
  }

  pendingPropose = {
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
    bot_info,
    memoryRelationIndex: '',
    ...pendingPropose,
  };

  //new pending propose
  const proposes = self.getProposes();
  const index = proposes.push(pendingPropose) - 1;
  self.setProposes(proposes);

  // create the first memory for auto-accepted lock
  if (pendingPropose.status === LOCK_STATUS_ACCEPTED) {
    apiCreateMemory(self, index, false, '', { hash: [] }, [true]);
  }

  // map address to propose
  const a2p = self.getA2p();
  if (!a2p[sender]) a2p[sender] = [];
  a2p[sender].push(index);
  if (!a2p[receiver]) a2p[receiver] = [];
  a2p[receiver].push(index);
  self.setA2p(a2p);

  //emit Event
  const log = { ...pendingPropose, id: index };
  self.emitEvent('createPropose', { by: sender, log }, ['by']);
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

  const [pro, proposes] = self.getPropose(lockIndex);
  if (pro.likes[sender]) {
    delete pro.likes[sender];
  } else {
    pro.likes[sender] = { type };
  }
  // save proposes
  self.setProposes(proposes);

  return pro.likes || [];
};
exports.apiChangeLockImg = (self, index, imgHash) => {
  const [pro, proposes] = self.getPropose(index);
  const sender = msg.sender;
  expect(sender === pro.receiver || sender === pro.sender, 'Permission deny. Can not change.');

  pro.coverImg = imgHash;
  // save proposes
  self.setProposes(proposes);
  //emit Event
  const log = { ...pro, id: index };
  self.emitEvent('changeCoverImg', { by: sender, log }, ['by']);
};
exports.apiFollowLock = (self, lockIndex) => {
  const sender = msg.sender;
  const [pro, proposes] = self.getPropose(lockIndex);
  const afl = self.getAFL();
  if (!afl[sender]) afl[sender] = [];
  const index = pro.follows.indexOf(sender);
  if (index !== -1) {
    // unfollowLock
    pro.follows.splice(index, 1);
    afl[sender].splice(afl[sender].indexOf(lockIndex), 1);
  } else {
    //  followLock
    pro.follows.push(sender);
    afl[sender].push(lockIndex);
  }
  // set map address follow lock
  self.setAFL(afl);

  // save proposes
  self.setProposes(proposes);
  return sender;
};
//private function
function _confirmLock(self, index, r_content, status, saveFlag) {
  const sender = msg.sender;
  const [pro, proposes] = self.getPropose(index);
  // status: pending: 0, accept_propose: 1, cancel_propose: 2
  switch (status) {
    case LOCK_STATUS_ACCEPTED:
      expect(sender === pro.receiver, "Can't accept propose. You must be receiver.");
      break;
    case LOCK_STATUS_DENIED:
      expectProposeOwners(pro, "You can't cancel propose.");
      break;
  }
  Object.assign(pro, { r_content, status });

  if (saveFlag) {
    self.setProposes(proposes);
  }

  //emit Event
  const log = { ...pro, id: index };
  self.emitEvent('confirmPropose', { by: sender, log }, ['by']);

  return [pro, proposes];
}

// ========== GET DATA ==================
exports.apiGetLocksByAddress = (self, address) => {
  const locks = self.getProposes();
  const locksIndex = self.getA2p()[address] || [];
  return _prepareData(locks, locksIndex);
};
exports.apiGetFollowingLocksByAddress = (self, address) => {
  const locks = self.getProposes();
  const locksIndex = self.getAFL()[address] || [];
  return _prepareData(locks, locksIndex);
};
exports.apiGetFollowingPersionLocksByAddress = (self, address) => {
  let resp = [];
  const followingAddress = self.getAFA()[address] || [];
  followingAddress.forEach(add => {
    let lock = apiGetLocksByAddress(self, add);
    resp.push([...lock]);
  });
  resp = Array.from(new Set(resp.map(JSON.stringify))).map(JSON.parse);
  return resp;
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
exports.apiGetLockByIndex = (self, index) => {
  const [pro] = self.getPropose(index);
  let resp = [];
  if (pro && pro.isPrivate) {
    expectProposeOwners(pro, "Can't get propose.");
  }
  resp.push(pro);
  return resp;
};
exports.apiGetLocksForFeed = (self, address) => {
  let resp = [];
  const ownerLocks = apiGetLocksByAddress(self, address);
  const followLocks = exports.apiGetFollowingLocksByAddress(self, address);
  const followPersionLocks = exports.apiGetFollowingPersionLocksByAddress(self, address);
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
  // remove duplicate locks
  resp = ownerLocks.concat(followLocks).concat(followPersionLocks);
  resp = Array.from(new Set(resp.map(JSON.stringify))).map(JSON.parse);
  // get more info from system.did, system.alias
  resp = _addInfoToLocks(resp, ownerLocksId);

  return { locks: resp, ownerLocksId, followLocksId, followPersionLocksId };
};

function _addInfoToLocks(locks, ownerLocksId = []) {
  const ctDid = loadContract('system.did');
  const ctAlias = loadContract('system.alias');
  locks.forEach(lock => {
    if (lock.type === LOCK_TYPE_JOURNAL) {
      lock.s_tags = ctDid.query.invokeView(lock.sender).tags || {};
    } else if (lock.type === LOCK_TYPE_CRUSH) {
      lock.bot_info.avatar = lock.bot_info.botAva;
      lock.bot_info['display-name'] = `${lock.bot_info.firstname} ${lock.bot_info.lastname}`;
      // lock.r_tags = lock.bot_info;
      // lock.r_alias = lock.s_alias;
    } else {
      lock.s_tags = ctDid.query.invokeView(lock.sender).tags || {};
      lock.r_tags = ctDid.query.invokeView(lock.receiver).tags || {};

      const s_alias = ctAlias.byAddress.invokeView(lock.sender);
      lock.s_alias = (Array.isArray(s_alias) ? s_alias[0] : s_alias).replace('account.', '');
      const r_alias = ctAlias.byAddress.invokeView(lock.receiver);
      lock.r_alias = (Array.isArray(r_alias) ? r_alias[0] : r_alias).replace('account.', '');
    }

    if (ownerLocksId.indexOf(lock.id) === -1) {
      lock.isMyLocks = false;
    } else {
      lock.isMyLocks = true;
    }
  });
  return locks;
}
