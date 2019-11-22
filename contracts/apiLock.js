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
    contributors: [],
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
exports.apiAddContributorsToLock = (self, lockIndex, contributors) => {
  const [pro, proposes] = self.getPropose(lockIndex);
  expect(pro.type === LOCK_TYPE_JOURNAL, 'Only support Journal.');
  expectProposeOwners(pro);
  const Schema = Joi.array().items(
    Joi.string()
      .max(43)
      .min(43)
  );
  contributors = validate(contributors, Schema);
  contributors = contributors.filter(addr => {
    return pro.contributors.indexOf(addr) === -1;
  });
  pro.contributors = pro.contributors.concat(contributors);
  // add follow lock
  const afl = self.getAFL();
  contributors.forEach(addr => {
    const index = pro.follows.indexOf(addr);
    if (index === -1) {
      //  followLock
      pro.follows.push(addr);
      afl[addr].push(lockIndex);
    }
  });
  self.setAFL(afl);
  // save proposes
  self.setProposes(proposes);
  return contributors;
};
exports.apiRemoveContributorsToLock = (self, lockIndex, contributors) => {
  const [pro, proposes] = self.getPropose(lockIndex);
  expectProposeOwners(pro);
  pro.contributors = pro.contributors.filter(addr => {
    return contributors.indexOf(addr) === -1;
  });
  // save proposes
  self.setProposes(proposes);
  return contributors;
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
exports.apiGetLocksByAddress = (self, addr) => {
  const locks = self.getProposes();
  const locksIndex = self.getA2p()[addr] || [];
  return _prepareData(locks, locksIndex);
};
exports.apiGetFollowingLocksByAddress = (self, addr) => {
  const locks = self.getProposes();
  const locksIndex = self.getAFL()[addr] || [];
  return _prepareData(locks, locksIndex);
};
exports.apiGetFollowingPersionLocksByAddress = (self, addr) => {
  const followingAddr = self.getFollowing()[addr] || [];
  let resp = followingAddr.reduce((res, addr) => {
    let lock = exports.apiGetLocksByAddress(self, addr);
    res.push({ ...lock[0] });
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
//   const [pro] = self.getPropose(index);
//   // let resp = [];
//   // if (pro && pro.isPrivate) {
//   //   expectProposeOwners(pro, "Can't get propose.");
//   // }
//   const newLock = _addTopInfoToLocks([pro], [pro.id]);
//   // resp.push(newLock[0]);
//   return newLock;
// };
exports.apiGetDetailLock = (self, index) => {
  const [pro] = self.getPropose(index);
  const newLock = _addTopInfoToLocks([pro]);
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
