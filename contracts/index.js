const { expect } = require(';');
const { expectProposeOwners, getDataByIndex } = require('./helper.js');

@contract
class LoveLock {
  // crush bot
  @view botAddress = 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn';

  // {
  //   isPrivate: false,
  //   sender: '',
  //   s_content: '',
  //   s_info: '',
  //   receiver: '',
  //   r_content: '',
  //   r_info: '',
  //   status: 0,
  //   memoryIndex: [],
  // },
  @view getProposes = () => this.getState('proposes', []);
  setProposes = value => this.setState('proposes', value);
  getPropose = index => {
    const proposes = this.getProposes();
    return [getDataByIndex(proposes, index), proposes];
  };

  // mapping: address to propose
  // 1:n { 'address':[1,2,3...] }
  @view getA2p = () => this.getState('a2p', {});
  setA2p = value => this.setState('a2p', value);

  // {
  //   isPrivate: false,
  //   sender: '',
  //   proIndex: 0,
  //   content: '',
  //   info: '',
  //   likes: [{ sender: {type} }],
  //   comments: [{ sender: '', content: '', info: '' }],
  // },
  @view getMemories = () => this.getState('memories', []);
  setMemories = value => this.setState('memories', value);
  getMemory = index => {
    const memories = this.getMemories();
    return [getDataByIndex(memories, index), memories];
  };

  // mapping: propose to memory
  // 1:n  { 'proindex':[1,2,3...] }
  @view getP2m = () => this.getState('p2m', {});
  setP2m = value => this.setState('p2m', value);

  // mapping: memory to propose
  // 1:1  { 'memoryindex':'proindex' }
  @view getM2p = () => this.getState('m2p', {});
  setM2p = value => this.setState('m2p', value);

  @transaction createPropose(s_content: string, receiver: address, s_info, bot_info) {
    const sender = msg.sender;
    const isPrivate = false;
    const defaultPropose = {
      coverImg: s_info.hash[0] || '',
      isPrivate,
      sender,
      s_content,
      s_info,
      receiver,
      r_content: '',
      r_info: '',
      status: 0,
      memoryIndex: [],
      bot_info,
      memoryRelationIndex: '',
      type: 0,
    };

    //expect(sender !== receiver, "Can't create owner propose.");

    let pendingPropose = {};
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    if (receiver === this.botAddress) {
      pendingPropose = { ...defaultPropose, status: 1, type: 2 };
    } else if (sender === receiver) {
      pendingPropose = { ...defaultPropose, status: 1, type: 1 };
    } else {
      pendingPropose = { ...defaultPropose, status: 0, type: 0 };
    }

    //new pending propose
    const proposes = this.getProposes();
    const index = proposes.push(pendingPropose) - 1;
    this.setProposes(proposes);
    if (receiver === this.botAddress || sender === receiver) {
      this._addMemory(index, false, '', { hash: [], date: Date.now() }, 1, [true]);
    }

    // map address to propose
    const a2p = this.getA2p();
    if (!a2p[sender]) a2p[sender] = [];
    a2p[sender].push(index);
    if (!a2p[receiver]) a2p[receiver] = [];
    a2p[receiver].push(index);
    this.setA2p(a2p);

    //emit Event
    const log = { ...pendingPropose, id: index };
    this.emitEvent('createPropose', { by: sender, log }, ['by']);
    return index;
  }

  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLikePropose(proIndex: number, type: number) {
    const sender = msg.sender;

    const [pro, proposes] = this.getPropose(proIndex);
    if (pro.likes[sender]) {
      delete pro.likes[sender];
    } else {
      pro.likes[sender] = { type };
    }

    // save proposes
    this.setProposes(proposes);

    // const log = Object.assign({}, like, { index });
    // this.emitEvent('addLike', { by: msg.sender, log }, ['by']);
  }

  @view getLikeByProIndex = (index: number) => this.getPropose(index)[0].likes;

  @transaction acceptPropose(proIndex: number, r_content: string) {
    const ret = this._confirmPropose(proIndex, r_content, 1);
    this._addMemory(proIndex, false, '', { hash: [], date: Date.now() }, 1, [true, ...ret]);
  }

  @transaction cancelPropose(proIndex: number, r_content: string) {
    this._confirmPropose(proIndex, r_content, 2, true);
  }

  @view getProposeByAddress(address: ?address) {
    if (!address) address = msg.sender;
    const arrPro = this.getA2p()[address] || [];
    let resp = [];
    const proposes = this.getProposes();
    arrPro.forEach(index => {
      let pro = getDataByIndex(proposes, index);
      pro = Object.assign({}, pro, { id: index });
      resp.push(pro);
    });
    resp = Array.from(new Set(resp.map(JSON.stringify))).map(JSON.parse);
    return resp;
  }

  @view getProposeByIndex(index: number) {
    const [pro] = this.getPropose(index);
    let resp = [];
    if (pro && pro.isPrivate) {
      expectProposeOwners(pro, "Can't get propose.");
    }
    resp.push(pro);
    return resp;
  }

  @view getMemoriesByProIndex(proIndex: number) {
    const memoryPro = this.getP2m()[proIndex] || [];
    const memories = this.getMemories();
    return memoryPro.reduce((res, index) => {
      const mem = getDataByIndex(memories, index);
      res.push({ ...mem, id: index });
      return res;
    }, []);
  }

  @view getMemoriesByRange(start: number, end: number) {
    const allMem = this.getMemories();
    let i = 0;
    let res = [];
    if (end > allMem.length) end = allMem.length;
    for (i = start; i < end; i++) {
      if (!allMem[i].isPrivate) {
        res.push({ ...allMem[i], id: i });
      }
    }
    return res;
  }

  _addMemory(
    proIndex: number,
    isPrivate: boolean,
    content: string,
    info,
    type = 0,
    [isFirstMemory, pro, proposes] = []
  ) {
    if (!pro || !proposes) {
      [pro, proposes] = this.getPropose(proIndex);
    }

    expect(msg.sender === pro.receiver || msg.sender === pro.sender, "Can't add memory. You must be owner propose.");
    const sender = msg.sender;
    const memory = { isPrivate, sender, proIndex, content, info, type, likes: {}, comments: [] };

    //new memories
    if (type === 1) {
      memory.receiver = pro.sender;
    }

    const memories = this.getMemories();
    const memIndex = memories.push(memory) - 1;
    this.setMemories(memories);

    // map index propose to index memory
    const p2m = this.getP2m();
    if (!p2m[proIndex]) p2m[proIndex] = [];
    p2m[proIndex].push(memIndex);
    this.setP2m(p2m);

    //map index memory to index propose
    const m2p = this.getM2p();
    m2p[memIndex] = proIndex;
    this.setM2p(m2p);

    // Add index into promise (duplicate => waste of gas, should not use!!)
    pro.memoryIndex.push(memIndex);

    if (isFirstMemory) {
      pro.memoryRelationIndex = memIndex;
    }

    // save the proposes
    this.setProposes(proposes);

    //emit Event
    const log = { ...memory, id: memIndex };
    this.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
    return memIndex;
  }

  // info { img:Array, location:string, date:string }
  @transaction addMemory(proIndex: number, isPrivate: boolean, content: string, info, type = 0) {
    return this._addMemory(proIndex, isPrivate, content, info, type);
  }

  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLike(memoIndex: number, type: number) {
    const sender = msg.sender;
    const [memo, memories] = this.getMemory(memoIndex);
    if (memo.likes[sender]) {
      delete memo.likes[sender];
    } else {
      memo.likes[sender] = { type };
    }

    // save the memeory
    this.setMemories(memories);

    this.emitEvent('addLike', { by: msg.sender, memoIndex }, ['by', 'memoIndex']);
  }

  @view getLikeByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].likes;

  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const sender = msg.sender;
    const [memo, memories] = this.getMemory(memoIndex);
    const newblock = block;
    const timestamp = Date.now();
    const comment = { sender, content, info, timestamp, newblock };
    memo.comments.push(comment);

    // save memories
    this.setMemories(memories);
  }

  @view getCommentsByMemoIndex = (memoIndex: number) => this.getMemory(memoIndex)[0].comments;

  //private function
  _confirmPropose(index: number, r_content: string, status: number, saveFlag: boolean) {
    const sender = msg.sender;
    const [pro, proposes] = this.getPropose(index);
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    switch (status) {
      case 1:
        expect(sender === pro.receiver, "Can't accept propose. You must be receiver.");
        break;
      case 2:
        expectProposeOwners(pro, "You can't cancel propose.");
        break;
    }
    Object.assign(pro, { r_content, status });

    if (saveFlag) {
      this.setProposes(proposes);
    }

    //emit Event
    const log = { ...pro, d: index };
    this.emitEvent('confirmPropose', { by: sender, log }, ['by']);

    return [pro, proposes];
  }

  @transaction changeCoverImg(index: number, coverImg: string) {
    const [pro, proposes] = this.getPropose(index);
    const sender = msg.sender;
    expect(sender === pro.receiver || sender === pro.sender, 'Permission deny. Can not change.');

    pro.coverImg = coverImg;

    // save proposes
    this.setProposes(proposes);

    //emit Event
    const log = { ...pro, id: index };
    this.emitEvent('changeCoverImg', { by: sender, log }, ['by']);
  }
}
