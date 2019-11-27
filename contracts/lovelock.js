const { expect, validate } = require(';');
const Joi = require('@hapi/joi');
const { expectLockOwners, getDataByIndex } = require('./helper.js');
const {
  apiCreateLock,
  apiAcceptLock,
  apiCancelLock,
  apiFollowLock,
  apiLikeLock,
  apiAddContributorsToLock,
  apiRemoveContributorsToLock,
  apiChangeLockImg,
  apiGetFollowingPersionLocksByAddress,
  apiGetFollowingLocksByAddress,
  apiGetDetailLock,
  apiGetLocksByAddress,
  apiGetLocksForFeed,
  apiGetDataForMypage,
  apiDeleteLock,
} = require('./apiLock.js');
const {
  apiCreateMemory,
  apiLikeMemory,
  apiCommentMemory,
  apiGetMemoriesByLock,
  apiGetMemoriesByRange,
  apiGetMemoriesByListMemIndex,
  apiDeleteMemory,
  apiDeleteComment,
} = require('./apiMemory.js');
const { importState, exportState, migrateState } = require('./migration.js')(this);

@contract
class LoveLock {
  // crush bot
  @view botAddress = 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn';

  constructor(account) {
    const owner = this.getOnwer();
    if (account) {
      owner.push(account);
    } else {
      owner.push(msg.sender);
    }
    this.setOnwer(owner);
  }
  @view getOnwer = () => this.getState('ownerContract', []);
  setOnwer = value => this.setState('ownerContract', value);

  @view getLocks = () => this.getState('locks', []);
  setLocks = value => this.setState('locks', value);
  getLock = index => {
    const locks = this.getLocks();
    return [getDataByIndex(locks, index), locks];
  };
  // function getMemory(index, defaultValue) {
  //   return this.getState([‘memories’, index], defaultValue)
  // }
  // function pushMemory(memo) {
  //   return this.invokeState([‘memories’], [], ‘push’, memo)
  // }
  // function saveLock(index, lock) {
  //   return this.setState([‘locks’, index], lock)
  // }
  // function saveLockName(index, name) {
  //   return this.setState([‘locks’, index, ‘name’], name)
  // }
  // setState([‘locks’, index], oldLock => Object.assign({}, oldLock || {}, { name: ‘thi’, age: 1 }))
  @view getMemories = () => this.getState('memories', []);
  setMemories = value => this.setState('memories', value);
  getMemory = index => {
    const memories = this.getMemories();
    return [getDataByIndex(memories, index), memories];
  };

  // mapping: address to lock
  // 1:n { 'address':[1,2,3...] }
  @view getA2p = () => this.getState('a2p', {});
  setA2p = value => this.setState('a2p', value);

  // mapping: lock to memory
  // 1:n  { 'proindex':[1,2,3...] }
  // @view getP2m = () => this.getState('p2m', {});
  // setP2m = value => this.setState('p2m', value);

  // mapping: memory to lock
  // 1:1  { 'memoryindex':'proindex' }
  // @view getM2p = () => this.getState('m2p', {});
  // setM2p = value => this.setState('m2p', value);

  // mapp address -> following locks.
  // 1:n  { 'address':[lockIndex1, lockIndex2,...] }
  @view getAFL = () => this.getState('afl', {});
  setAFL = value => this.setState('afl', value);

  // mapping: person -> other person
  // 1:n { 'address':[address1,address2,address3...] }
  @view getFollowing = () => this.getState('following', {});
  setFollowing = value => this.setState('following', value);

  @view getFollowed = () => this.getState('followed', {});
  setFollowed = value => this.setState('followed', value);

  @transaction createLock(s_content: string, receiver: address, s_info = {}, bot_info): number {
    const self = this;
    return apiCreateLock(self, s_content, receiver, s_info, bot_info);
  }
  @transaction acceptLock(index: number, r_content: string) {
    const self = this;
    return apiAcceptLock(self, index, r_content);
  }
  @transaction cancelLock(index: number, r_content: string) {
    const self = this;
    return apiCancelLock(self, index, r_content);
  }
  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLikeLock(index: number, type: number) {
    const self = this;
    return apiLikeLock(self, index, type);
  }
  @transaction followLock(index: number) {
    const self = this;
    return apiFollowLock(self, index);
  }
  @transaction addContributorsToLock(index: number, contributors = []) {
    const self = this;
    return apiAddContributorsToLock(self, index, contributors);
  }
  @transaction removeContributorsToLock(index: number, contributors = []) {
    const self = this;
    return apiRemoveContributorsToLock(self, index, contributors);
  }
  @transaction changeCoverImg(index: number, imgHash: string) {
    const self = this;
    return apiChangeLockImg(self, index, imgHash);
  }
  @view getLockByAddress(addr: address) {
    const self = this;
    return apiGetLocksByAddress(self, addr);
  }
  @view getDetailLock(index: number) {
    const self = this;
    return apiGetDetailLock(self, index);
  }
  @view getLikeByLockIndex = (index: number) => this.getLock(index)[0].likes;
  @view getFollowByLockIndex = (index: number) => this.getLock(index)[0].follows;
  @view getLocksForFeed = (addr: address) => {
    const self = this;
    return apiGetLocksForFeed(self, addr);
  };
  @view getMaxLocksIndex = () => {
    const locks = this.getLocks();
    return locks.length - 1;
  };
  // =========== MEMORY ================
  // info { img:Array, location:string, date:string }
  @transaction addMemory(lockIndex: number, isPrivate: boolean, content: string, info) {
    const self = this;
    return apiCreateMemory(self, lockIndex, isPrivate, content, info);
  }
  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLike(memoIndex: number, type: number) {
    const self = this;
    return apiLikeMemory(self, memoIndex, type);
  }
  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const self = this;
    return apiCommentMemory(self, memoIndex, content, info);
  }
  @view getMemoriesByLockIndex(lockIndex: number, collectionId: ?number) {
    const self = this;
    return apiGetMemoriesByLock(self, lockIndex, collectionId);
  }
  @view getMemoriesByRange(start: number, end: number) {
    const self = this;
    return apiGetMemoriesByRange(self, start, end);
  }
  @view getMemoriesByListMemIndex(listMemIndex) {
    const self = this;
    return apiGetMemoriesByListMemIndex(self, listMemIndex);
  }
  @view getLikeByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].likes;
  @view getCommentsByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].comments;
  // =========== COLLECTION ================
  @view getLockCollections(lockIndex: number) {
    const [lock] = this.getLock(lockIndex);

    // Note: the collection is not sorted by ID, client should sort if desired
    return lock.collections || [];
  }

  validateCollectionName = (newName, collections) => {
    if (!newName || !newName.trim()) throw new Error('Invalid name.');
    const normalName = newName.trim().normalize();
    if (normalName.length < 4 || normalName.length > 16) {
      throw new Error(`Collection name must be 4~16 characters.`);
    }
    const lname = normalName.toLowerCase();

    collections.forEach(({ name }) => {
      if (lname === name.toLowerCase()) {
        throw new Error(`Collection name ${newName} already exists.`);
      }
    });

    return normalName;
  };

  @transaction addLockCollection(lockIndex: number, collectionData): number {
    const [lock, locks] = this.getLock(lockIndex);
    expectLockOwners(lock);

    const cols = (lock.collections = lock.collections || []);
    const MAX_COLLECTION_PER_LOCK = 5;
    if (cols.length >= MAX_COLLECTION_PER_LOCK) {
      throw new Error(`This lock already has ${MAX_COLLECTION_PER_LOCK} collections and cannot create more.`);
    }

    collectionData = validate(
      collectionData,
      Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
        avatar: Joi.string(),
        banner: Joi.string(),
      })
        .label('collectionData')
        .required()
    );

    collectionData.name = this.validateCollectionName(collectionData.name, cols);

    lock.nextCollectionId = lock.nextCollectionId || 0;
    collectionData.id = lock.nextCollectionId;
    lock.nextCollectionId++;
    cols.push(collectionData);

    this.setLocks(locks);

    return collectionData.id;
  }

  @transaction setLockCollection(lockIndex: number, collectionId: number, collectionData) {
    const [lock, locks] = this.getLock(lockIndex);
    expectLockOwners(lock);

    collectionData = validate(
      collectionData,
      Joi.object({
        id: Joi.number(),
        name: Joi.string(),
        description: Joi.string(),
        avatar: Joi.string(),
        banner: Joi.string(),
      })
        .label('collectionData')
        .or('name', 'description', 'avatar', 'banner')
    );

    if (collectionData != null && collectionData.hasOwnProperty('id') && collectionData.id !== collectionId) {
      throw new Error(
        `The specified collectionId ${collectionId} does not match collectionData.id ${collectionData.id}`
      );
    }

    const cols = (lock.collections = lock.collections || []);
    if (collectionData.hasOwnProperty('name')) {
      collectionData.name = this.validateCollectionName(collectionData.name, cols);
    }

    const oldIndex = cols.findIndex(c => c.id === collectionId);
    const old = oldIndex >= 0 ? cols[oldIndex] : null;
    if (old) {
      if (collectionData == null) {
        // delete
        cols.splice(oldIndex, 1);

        // this method is faster but not sorted
        // cols[oldIndex] = cols[cols.length - 1]
        // cols.pop()
      } else {
        // update
        Object.assign(old, collectionData);
      }
    } else {
      // It is an error
      // If user wants to create new, should use addLockCollection method instead
      throw new Error(`Collection id ${collectionId} does not exist in lock ${lockIndex}`);
    }

    this.setLocks(locks);
  }
  // =========== OTHER ================
  @transaction followPerson(address: address) {
    const sender = msg.sender;
    const following = this.getFollowing();
    const followed = this.getFollowed();
    if (!following[sender]) following[sender] = [];
    const index = following[sender].indexOf(address);
    if (index !== -1) {
      // unfollowLock
      following[sender].splice(index, 1);
    } else {
      //  followLock
      following[sender].push(address);
    }
    if (!followed[address]) followed[address] = [];
    const index2 = followed[address].indexOf(sender);
    if (index2 !== -1) {
      // unfollowLock
      followed[address].splice(index2, 1);
    } else {
      //  followLock
      followed[address].push(sender);
    }

    this.setFollowing(following);
    this.setFollowed(followed);
  }
  @view getFollowedPerson = (addr: address) => this.getFollowed()[addr] || [];
  @view getFollowingPerson = (addr: address) => this.getFollowing()[addr] || [];
  @view getFollowingLocksByAddress = (addr: address) => apiGetFollowingLocksByAddress(this, addr);
  @view getFollowingPersionLocksByAddress = (addr: address) => apiGetFollowingPersionLocksByAddress(this, addr);

  @view getDataForMypage(addr: address) {
    const self = this;
    return apiGetDataForMypage(self, addr);
  }

  // ========== DATA MIGRATION =============
  @view exportState() {
    return exportState();
  }

  @transaction importState(data, overwrite: ?boolean = false) {
    return importState(data, overwrite);
  }

  @transaction migrateState(fromContract: address, overwrite: ?boolean = false) {
    return migrateState(fromContract, overwrite);
  }
  // ========== DELETE DATA  =============
  @view getAdmins = () => this.getState('admins', []);
  setAdmins = value => this.setState('admins', value);

  @transaction addAdmins(accounts) {
    const schema = Joi.array().items(
      Joi.string()
        .max(43)
        .min(43)
    );
    accounts = validate(accounts, schema);
    if (this.getOnwer().includes(msg.sender)) {
      let admins = this.getAdmins();
      admins = admins.concat(accounts);
      this.setAdmins(admins);
    } else {
      throw new Error(`You must be owner contract`);
    }
    return accounts;
  }

  @transaction removeAdmins(accounts) {
    const schema = Joi.array().items(
      Joi.string()
        .max(43)
        .min(43)
    );
    accounts = validate(accounts, schema);
    if (this.getOnwer().includes(msg.sender)) {
      let admins = this.getAdmins();
      admins = admins.filter(addr => {
        return accounts.indexOf(addr) === -1;
      });
      this.setAdmins(admins);
    } else {
      throw new Error(`You must be owner contract`);
    }
    return accounts;
  }

  @transaction deleteLock(lockindex: number) {
    const self = this;
    return apiDeleteLock(self, lockindex);
  }
  @transaction deleteMemory(memIndex: number) {
    const self = this;
    return apiDeleteMemory(self, memIndex);
  }
  @transaction deleteComment(memIndex: number, cmtNo: number) {
    const self = this;
    return apiDeleteComment(self, memIndex, cmtNo);
  }
}
