const { expect, validate } = require(';');
const Joi = require('@hapi/joi');
const { expectProposeOwners, getDataByIndex } = require('./helper.js');
const {
  apiCreateLock,
  apiAcceptLock,
  apiCancelLock,
  apiFollowLock,
  apiLikeLock,
  apiChangeLockImg,
  apiGetTopInfoLockByIndex,
  apiGetLocksByAddress,
  apiGetLocksForFeed,
} = require('./apiLock.js');
const {
  apiCreateMemory,
  apiLikeMemory,
  apiCommentMemory,
  apiGetMemoriesByLock,
  apiGetMemoriesByRange,
  apiGetMemoriesByListMemIndex,
} = require('./apiMemory.js');
const { importState, exportState, migrateState } = require('./migration.js')(this);

@contract
class LoveLock {
  // crush bot
  @view botAddress = 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn';

  @view getProposes = () => this.getState('proposes', []);
  setProposes = value => this.setState('proposes', value);
  getPropose = index => {
    const proposes = this.getProposes();
    return [getDataByIndex(proposes, index), proposes];
  };
  // function getMemory(index, defaultValue) {
  //   return this.getState([‘memories’, index], defaultValue)
  // }
  // function pushMemory(memo) {
  //   return this.invokeState([‘memories’], [], ‘push’, memo)
  // }
  // function saveLock(index, lock) {
  //   return this.setState([‘proposes’, index], lock)
  // }
  // function saveLockName(index, name) {
  //   return this.setState([‘proposes’, index, ‘name’], name)
  // }
  // setState([‘locks’, index], oldLock => Object.assign({}, oldLock || {}, { name: ‘thi’, age: 1 }))
  @view getMemories = () => this.getState('memories', []);
  setMemories = value => this.setState('memories', value);
  getMemory = index => {
    const memories = this.getMemories();
    return [getDataByIndex(memories, index), memories];
  };

  // mapping: address to propose
  // 1:n { 'address':[1,2,3...] }
  @view getA2p = () => this.getState('a2p', {});
  setA2p = value => this.setState('a2p', value);

  // mapping: propose to memory
  // 1:n  { 'proindex':[1,2,3...] }
  // @view getP2m = () => this.getState('p2m', {});
  // setP2m = value => this.setState('p2m', value);

  // mapping: memory to propose
  // 1:1  { 'memoryindex':'proindex' }
  // @view getM2p = () => this.getState('m2p', {});
  // setM2p = value => this.setState('m2p', value);

  // mapp address -> following locks.
  // 1:n  { 'address':[lockIndex1, lockIndex2,...] }
  @view getAFL = () => this.getState('afl', {});
  setAFL = value => this.setState('afl', value);

  // mapping: person -> other person
  // 1:n { 'address':[address1,address2,address3...] }
  @view getAFA = () => this.getState('afa', {});
  setAFA = value => this.setState('afa', value);

  // mapping follow: save addresses following lock
  // 1:n  { 'lockIndex':[address1, address2...] }
  // @view getLFA = () => this.getState('lfa', {});
  // setLFA = value => this.setState('lfa', value);

  // mapping follow: save address following other address
  // 1:n  { 'address':[address1, address1,...] }

  @transaction createPropose(s_content: string, receiver: address, s_info = {}, bot_info): number {
    const self = this;
    return apiCreateLock(self, s_content, receiver, s_info, bot_info);
  }
  @transaction acceptPropose(index: number, r_content: string) {
    const self = this;
    return apiAcceptLock(self, index, r_content);
  }
  @transaction cancelPropose(index: number, r_content: string) {
    const self = this;
    return apiCancelLock(self, index, r_content);
  }
  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLikePropose(index: number, type: number) {
    const self = this;
    return apiLikeLock(self, index, type);
  }
  @transaction followLock(index: number) {
    const self = this;
    return apiFollowLock(self, index);
  }
  @transaction changeCoverImg(index: number, imgHash: string) {
    const self = this;
    return apiChangeLockImg(self, index, imgHash);
  }
  @view getProposeByAddress(address: address) {
    const self = this;
    return apiGetLocksByAddress(self, address);
  }
  @view getProposeByIndex(index: number) {
    const self = this;
    return apiGetTopInfoLockByIndex(self, index);
  }
  @view getLikeByProIndex = (index: number) => this.getPropose(index)[0].likes;
  @view getFollowByLockIndex = (index: number) => this.getPropose(index)[0].follows;
  @view getLocksForFeed = (address: address) => {
    const self = this;
    return apiGetLocksForFeed(self, address);
  };
  @view getMaxLocksIndex = () => {
    const proposes = this.getProposes();
    return proposes.length - 1;
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
  @view getMemoriesByProIndex(lockIndex: number, collectionId: ?number) {
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
    const [lock] = this.getPropose(lockIndex);

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
    const [lock, locks] = this.getPropose(lockIndex);
    expectProposeOwners(lock);

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

    this.setProposes(locks);

    return collectionData.id;
  }

  @transaction setLockCollection(lockIndex: number, collectionId: number, collectionData) {
    const [lock, locks] = this.getPropose(lockIndex);
    expectProposeOwners(lock);

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

    this.setProposes(locks);
  }
  // =========== OTHER ================
  @transaction setFlowPerson(address: address) {
    const sender = msg.sender;
    const afp = this.getAFA();

    if (!afp[sender]) afp[sender] = [];
    afp[sender].push(address);
    if (!afp[address]) afp[address] = [];
    afp[address].push(sender);
    this.setAFA(afp);
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
}
