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
  const index = pro.follows.indexOf(sender);
  if (index !== -1) {
    // unfollowLock
    pro.follows.splice(index, 1);
  } else {
    //  followLock
    pro.follows.push(sender);
  }
  // save proposes
  self.setProposes(proposes);
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
exports.apiGetLockByAddress = (self, address) => {
  if (!address) address = msg.sender;
  const arrPro = self.getA2p()[address] || [];
  let resp = [];
  const proposes = self.getProposes();
  arrPro.forEach(index => {
    let pro = getDataByIndex(proposes, index);
    pro = Object.assign({}, pro, { id: index });
    resp.push(pro);
  });
  resp = Array.from(new Set(resp.map(JSON.stringify))).map(JSON.parse);
  return resp;
};
exports.apiGetLockByIndex = (self, index) => {
  const [pro] = self.getPropose(index);
  let resp = [];
  if (pro && pro.isPrivate) {
    expectProposeOwners(pro, "Can't get propose.");
  }
  resp.push(pro);
  return resp;
};
