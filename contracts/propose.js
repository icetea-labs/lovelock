const { expect } = require(';');
const { isOwnerPropose, getDataByIndex } = require('./helper.js');
@contract
class Propose {
  // {
  //   isPrivate: false,
  //   sender: '',
  //   s_content: '',
  //   s_info: '',
  //   receiver: '',const { expect } = require(';');
const { isOwnerPropose, getDataByIndex } = require('./helper.js');
@contract
class Propose {
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
  @view @state propose = [];
  @view @state add2p = {}; //1:n { 'address':[1,2,3...] }

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

    expect(sender !== receiver, "Can't create owner propose.");

    let pendingPropose = {};
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    if (receiver === 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn') {
      pendingPropose = { ...defaultPropose, status: 1 };
    } else {
      pendingPropose = { ...defaultPropose, status: 0 };
    }

    //new pending propose
    const x = this.propose;
    const index = x.push(pendingPropose) - 1;
    this.propose = x;

    //map address to propose
    const y = this.add2p;
    if (!y[sender]) y[sender] = [];
    y[sender].push(index);
    if (!y[receiver]) y[receiver] = [];
    y[receiver].push(index);
    this.add2p = y;

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

  @view getProposeByAddress(address) {
    if (address === 'undefined') address = msg.sender;
    const arrPro = this.add2p[address] || [];
    let resp = [];
    arrPro.forEach(index => {
      let pro = getDataByIndex(this.propose, index);
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
    const pro = getDataByIndex(this.propose, index);
    let resp = [];
    if (pro && pro.isPrivate) {
      isOwnerPropose(pro, "Can't get propose.", msg.sender);
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
    let pro = getDataByIndex(this.propose, proIndex);
    expect(msg.sender === pro.receiver || msg.sender === pro.sender, "Can't add memory. You must be owner propose.");
    const sender = msg.sender;

    //new memories
    const menory = { isPrivate, sender, proIndex, content, info, likes: {}, comments: [] };
    const x = this.memories;
    const index = x.push(menory) - 1;
    this.memories = x;

    //map index propose to index memory
    const y = this.p2m;
    if (!y[proIndex]) y[proIndex] = [];
    y[proIndex].push(index);
    this.p2m = y;

    //map index memory to index propose
    const z = this.m2p;
    z[index] = proIndex;
    this.m2p = z;

    //
    pro.memoryIndex.push(index);
    this.propose[proIndex] = pro;
    //emit Event
    const log = Object.assign({}, menory, { id: index });
    this.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
  }

  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLike(memoIndex: number, type: number) {
    const sender = msg.sender;
    let obj = getDataByIndex(this.memories, memoIndex);
    if (obj.likes[sender]) {
      delete obj.likes[sender];
    } else {
      obj.likes[sender] = {};
      obj.likes[sender].type = type;
    }
    this.memories[memoIndex] = obj;
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
    const comment = { sender, content, info };
    obj.comments.push(comment);
    this.memories[memoIndex] = obj;
  }

  @view getCommentsByMemoIndex(memoIndex: number) {
    const obj = getDataByIndex(this.memories, memoIndex);
    return obj.comments;
  }

  //private function
  _confirmPropose(index: number, r_content: string, status: number) {
    const sender = msg.sender;
    let pro = getDataByIndex(this.propose, index);
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    switch (status) {
      case 1:
        expect(sender === pro.receiver, "Can't accept propose. You must be receiver.");
        break;
      case 2:
        isOwnerPropose(pro, "You can't cancel propose.", msg.sender);
        break;
    }
    pro = Object.assign({}, pro, { r_content, status });
    this.propose[index] = pro;

    //emit Event
    const log = Object.assign({}, pro, { id: index });
    this.emitEvent('confirmPropose', { by: sender, log }, ['by']);
  }
}

  //   r_content: '',
  //   r_info: '',
  //   status: 0,
  //   memoryIndex: [],
  // },
  @view @state propose = [];
  @view @state add2p = {}; //1:n { 'address':[1,2,3...] }

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

  @transaction createPropose(s_content: string, receiver: string, s_info: string) {
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
    };

    expect(sender !== receiver, "Can't create owner propose.");

    let pendingPropose = {};
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    if (receiver === 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn') {
      pendingPropose = { ...defaultPropose, status: 1 };
    } else {
      pendingPropose = { ...defaultPropose, status: 0 };
    }

    //new pending propose
    const x = this.propose;
    const index = x.push(pendingPropose) - 1;
    this.propose = x;

    //map address to propose
    const y = this.add2p;
    if (!y[sender]) y[sender] = [];
    y[sender].push(index);
    if (!y[receiver]) y[receiver] = [];
    y[receiver].push(index);
    this.add2p = y;

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

  @view getProposeByAddress(address) {
    if (address === 'undefined') address = msg.sender;
    const arrPro = this.add2p[address] || [];
    let resp = [];
    arrPro.forEach(index => {
      let pro = getDataByIndex(this.propose, index);
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
    const pro = getDataByIndex(this.propose, index);
    let resp = [];
    if (pro && pro.isPrivate) {
      isOwnerPropose(pro, "Can't get propose.", msg.sender);
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
    let pro = getDataByIndex(this.propose, proIndex);
    expect(msg.sender === pro.receiver || msg.sender === pro.sender, "Can't add memory. You must be owner propose.");
    const sender = msg.sender;

    //new memories
    const menory = { isPrivate, sender, proIndex, content, info, likes: {}, comments: [] };
    const x = this.memories;
    const index = x.push(menory) - 1;
    this.memories = x;

    //map index propose to index memory
    const y = this.p2m;
    if (!y[proIndex]) y[proIndex] = [];
    y[proIndex].push(index);
    this.p2m = y;

    //map index memory to index propose
    const z = this.m2p;
    z[index] = proIndex;
    this.m2p = z;

    //
    pro.memoryIndex.push(index);
    this.propose[proIndex] = pro;
    //emit Event
    const log = Object.assign({}, menory, { id: index });
    this.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
  }

  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLike(memoIndex: number, type: number) {
    const sender = msg.sender;
    let obj = getDataByIndex(this.memories, memoIndex);
    if (obj.likes[sender]) {
      delete obj.likes[sender];
    } else {
      obj.likes[sender] = {};
      obj.likes[sender].type = type;
    }
    this.memories[memoIndex] = obj;
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
    const comment = { sender, content, info };
    obj.comments.push(comment);
    this.memories[memoIndex] = obj;
  }

  @view getCommentsByMemoIndex(memoIndex: number) {
    const obj = getDataByIndex(this.memories, memoIndex);
    return obj.comments;
  }

  //private function
  _confirmPropose(index: number, r_content: string, status: number) {
    const sender = msg.sender;
    let pro = getDataByIndex(this.propose, index);
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    switch (status) {
      case 1:
        expect(sender === pro.receiver, "Can't accept propose. You must be receiver.");
        break;
      case 2:
        isOwnerPropose(pro, "You can't cancel propose.", msg.sender);
        break;
    }
    pro = Object.assign({}, pro, { r_content, status });
    this.propose[index] = pro;

    //emit Event
    const log = Object.assign({}, pro, { id: index });
    this.emitEvent('confirmPropose', { by: sender, log }, ['by']);
  }
}
