const { expect } = require(';');
const { isOwnerPropose, getDataByIndex } = require('./helper.js');
@contract
class LoveLock {
  
  // {
  //   isPrivate: false,
  //   sender: '',
  //   s_content: '',
  //   s_info: '',
  //   receiver: '',
  //   r_content: '',
  //   r_info: '',
  //   status: 0
  // },
  @view @state proposes = [];
  @view @state a2p = {}; //1:n { 'address':[1,2,3...] }

  // {
  //   isPrivate: false,
  //   sender: '',
  //   proIndex: 0,
  //   content: '',
  //   info: '',
  //   likes: [{ sender: {type} }],
  //   comments: [{ sender: '', content: '', info: '' }],
  // },
  @view @state memories = [];
  @view @state p2m = {}; //1:n  { 'proindex':[1,2,3...] }
  @view @state m2p = {}; //1:1  { 'memoryindex':'proindex' }

  @transaction createPropose(s_content: string, receiver: string, s_info: string, bot_info: string) {
    const sender = msg.sender;
    const isPrivate = false;
    const defaultPropose = {
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
    };

    // expect(sender !== receiver, "Cannot promise to yourself.");

    let pendingPropose = {};
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    if (receiver === 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn') {
      pendingPropose = { ...defaultPropose, status: 1 };
    } else {
      pendingPropose = { ...defaultPropose, status: 0 };
    }

    //new pending propose
    const index = this.proposes.push(pendingPropose) - 1;

    //map address to propose
    const a2p = this.a2p;
    if (!a2p[sender]) a2p[sender] = [];
    a2p[sender].push(index);
    if (!a2p[receiver]) a2p[receiver] = [];
    a2p[receiver].push(index);

    //emit Event
    const log = Object.assign({}, pendingPropose, { id: index });
    this.emitEvent('createPropose', { by: sender, log }, ['by']);
  }

  @transaction acceptPropose(proIndex: number, r_content: string) {
    this._confirmPropose(proIndex, r_content, 1);
  }

  @transaction cancelPropose(proIndex: number, r_content: string) {
    this._confirmPropose(proIndex, r_content, 2);
  }

  @view getProposeByAddress(address: string) {
    address = address || msg.sender
    const arrPro = this.a2p[address] || [];
    let resp = [];
    arrPro.forEach(index => {
      let pro = getDataByIndex(this.proposes, index);
      pro = Object.assign({}, pro, { id: index });
      if (pro.isPrivate && (msg.sender === pro.sender || msg.sender === pro.receiver)) {
        resp.push(pro);
      } else {
        resp.push(pro);
      }
    });

    return resp;
  }

  @view getProposeByIndex(index: number) {
    const pro = getDataByIndex(this.proposes, index);
    let resp = [];
    if (pro && pro.isPrivate) {
      isOwnerPropose(pro, "Cannot get propose.", msg.sender);
    }
    resp.push(pro);
    return resp;
  }

  @view getMemoriesByProIndex(proIndex: number) {
    const memoryPro = this.p2m[proIndex] || [];
    let res = [];
    memoryPro.forEach(index => {
      const mem = getDataByIndex(this.memories, index);
      const obj = Object.assign({}, mem, { id: index });
      res.push(obj);
    });
    return res;
  }

  @view getMemoriesByRange(start: number, end: number) {
    const allMem = this.memories;
    let i = 0;
    let res = [];
    if (end > allMem.length) end = allMem.length;
    for (i = start; i < end; i++) {
      if (!allMem[i].isPrivate) {
        const obj = Object.assign({}, allMem[i], { id: i });
        res.push(obj);
      }
    }
    return res;
  }
  // info { img:Array, location:string, date:string }
  @transaction addMemory(proIndex: number, isPrivate: boolean, content: string, info: string) {
    let pro = getDataByIndex(this.proposes, proIndex);
    expect(msg.sender === pro.receiver || msg.sender === pro.sender, "Cannot add memory to other people's timeline.");
    const sender = msg.sender;

    //new memories
    const menory = { isPrivate, sender, proIndex, content, info, likes: {}, comments: [] };
    const index = this.memories.push(menory) - 1;

    //map index propose to index memory
    const p2m = this.p2m;
    if (!p2m[proIndex]) p2m[proIndex] = [];
    p2m[proIndex].push(index);

    //map index memory to index propose
    this.m2p[index] = proIndex;

    //emit Event
    const log = Object.assign({}, menory, { id: index });
    this.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
  }

  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLike(memoIndex: number, type: number) {
    const sender = msg.sender;
    let obj = getDataByIndex(this.memories, memoIndex);
    if (obj.likes[sender]) {
      // unlike
      delete obj.likes[sender];
    } else {
      obj.likes[sender] = { type };
    }

    // const log = Object.assign({}, like, { index });
    // this.emitEvent('addLike', { by: msg.sender, log }, ['by']);
  }

  @view getLikeByMemoIndex(memoIndex: number) {
    const obj = getDataByIndex(this.memories, memoIndex);
    return obj.likes;
  }

  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const sender = msg.sender;
    let obj = getDataByIndex(this.memories, memoIndex);
    const timestamp = block.timestamp;
    const comment = { sender, content, info, timestamp };
    obj.comments.push(comment);
  }

  @view getCommentsByMemoIndex(memoIndex: number) {
    const obj = getDataByIndex(this.memories, memoIndex);
    return obj.comments;
  }

  //private function
  _confirmPropose(index: number, r_content: string, status: number) {
    const sender = msg.sender;
    let pro = getDataByIndex(this.proposes, index);
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    switch (status) {
      case 1:
        expect(sender === pro.receiver, "Can't accept propose. You must be receiver.");
        break;
      case 2:
        isOwnerPropose(pro, "You can't cancel propose.", msg.sender);
        break;
    }
    Object.assign(pro, { r_content, status });

    //emit Event
    const log = Object.assign({}, pro, { id: index });
    this.emitEvent('confirmPropose', { by: sender, log }, ['by']);
  }
}
