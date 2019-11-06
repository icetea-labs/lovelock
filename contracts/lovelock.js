const { expect } = require(';');
const { expectProposeOwners, getDataByIndex } = require('./helper.js');
const {
  apiCreateLock,
  apiAcceptLock,
  apiCancelLock,
  apiFlowLock,
  apiLikeLock,
  apiGetLockByAddress,
  apiGetLockByIndex,
  apiChangeLockImg,
} = require('./apiLock.js');
const {
  apiCreateMemory,
  apiLikeMemory,
  apiCommentMemory,
  apiGetMemoriesByLock,
  apiGetMemoriesByRange,
} = require('./apiMemory.js');

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

  // mapping: person to person
  // 1:n { 'address':[address1,address2,address3...] }
  @view getAFA = () => this.getState('afa', {});
  setAFA = value => this.setState('afa', value);
  // mapping: propose to memory
  // 1:n  { 'proindex':[1,2,3...] }
  // @view getP2m = () => this.getState('p2m', {});
  // setP2m = value => this.setState('p2m', value);

  // mapping: memory to propose
  // 1:1  { 'memoryindex':'proindex' }
  // @view getM2p = () => this.getState('m2p', {});
  // setM2p = value => this.setState('m2p', value);

  // mapping follow: save locks index that address following
  // 1:n  { 'address':[lockIndex1, lockIndex2,...] }
  // @view getAFL = () => this.getState('afl', {});
  // setAFL = value => this.setState('afl', value);

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
    apiAcceptLock(self, index, r_content);
  }
  @transaction cancelPropose(index: number, r_content: string) {
    const self = this;
    apiCancelLock(self, index, r_content);
  }
  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLikePropose(index: number, type: number) {
    const self = this;
    apiLikeLock(self, index, type);
  }
  @transaction addFlowLock(index: number) {
    const self = this;
    apiFlowLock(self, index);
  }
  @transaction changeCoverImg(index: number, imgHash: string) {
    const self = this;
    apiChangeLockImg(self, index, imgHash);
  }
  @view getProposeByAddress(address: ?address) {
    const self = this;
    return apiGetLockByAddress(self, address);
  }
  @view getProposeByIndex(index: number) {
    const self = this;
    return apiGetLockByIndex(self, index);
  }
  @view getLikeByProIndex = (index: number) => this.getPropose(index)[0].likes;
  @view getFollowByLockIndex = (index: number) => this.getPropose(index)[0].follows;

  // =========== MEMORY ================
  // info { img:Array, location:string, date:string }
  @transaction addMemory(lockIndex: number, isPrivate: boolean, content: string, info) {
    const self = this;
    return apiCreateMemory(self, lockIndex, isPrivate, content, info);
  }
  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLike(memoIndex: number, type: number) {
    const self = this;
    apiLikeMemory(self, memoIndex, type);
  }
  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const self = this;
    apiCommentMemory(self, memoIndex, content, info);
  }
  @view getMemoriesByProIndex(lockIndex: number) {
    const self = this;
    return apiGetMemoriesByLock(self, lockIndex);
  }
  @view getMemoriesByRange(start: number, end: number) {
    const self = this;
    return apiGetMemoriesByRange(self, start, end);
  }
  @view getLikeByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].likes;
  @view getCommentsByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].comments;

  // =========== OTHER ================
  @transaction setFlowPerson(address: ?address) {
    const sender = msg.sender;
    const afp = this.getAFA();

    if (!afp[sender]) afp[sender] = [];
    afp[sender].push(address);
    if (!afp[address]) afp[address] = [];
    afp[address].push(sender);
    this.setAFA(afp);
  }
}
