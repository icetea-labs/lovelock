const { expect } = require(';');
const { isOwnerPropose, getDataByIndex } = require('./helper.js')

@contract
class LoveLock {

  // crush bot
  botAddress = 'teat02kspncvd39pg0waz8v5g0wl6gqus56m36l36sn';

  useState = (name, defaultValue) => {
    return [
      () => this.getState(name, defaultValue),
      v => this.setState(name, v)
    ]
  }

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
  useProposes = () => this.useState('proposes', [])

  // mapping: address to propose
  // 1:n { 'address':[1,2,3...] }
  useA2p = () => this.useState('a2p', {})
  
  // {
  //   isPrivate: false,
  //   sender: '',
  //   proIndex: 0,
  //   content: '',
  //   info: '',
  //   likes: [{ sender: {type} }],
  //   comments: [{ sender: '', content: '', info: '' }],
  // },
  useMemories = () => this.useState('memories', [])

  // mapping: propose to memory
  // 1:n  { 'proindex':[1,2,3...] }
  useP2m = () => this.useState('p2m', {})

  // mapping: memory to propose
  // 1:1  { 'memoryindex':'proindex' }
  useM2p = () => this.useState('m2p', {})

  @transaction createPropose(s_content: string, receiver: address, s_info, bot_info) {
    const sender = msg.sender;
    const isPrivate = false;
    const defaultPropose = {
      coverImg: s_info.hash[0] ? s_info.hash[0] : '',
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
    };

    //expect(sender !== receiver, "Can't create owner propose.");

    let pendingPropose = {};
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    if (receiver === this.botAddress || sender === receiver) {
      pendingPropose = { ...defaultPropose, status: 1 };
    } else {
      pendingPropose = { ...defaultPropose, status: 0 };
    }

    //new pending propose
    const [getProposes, setProposes] = this.useProposes()
    const x = getProposes()
    const index = x.push(pendingPropose) - 1;
    setProposes(x)

    // map address to propose
    const [getA2p, setA2p] = this.useA2p()
    const y = getA2p()
    if (!y[sender]) y[sender] = [];
    y[sender].push(index);
    if (!y[receiver]) y[receiver] = [];
    y[receiver].push(index);
    setA2p(y)

    //emit Event
    const log = Object.assign({}, pendingPropose, { id: index });
    this.emitEvent('createPropose', { by: sender, log }, ['by']);
    return index;
  }
  // create like for memory: type -> 0:unlike, 1:like, 2:love
  @transaction addLikePropose(proIndex: number, type: number) {
    const sender = msg.sender;

    const [getProposes, setProposes] = this.useProposes()
    const proposes = getProposes()

    let obj = getDataByIndex(proposes, proIndex);
    if (obj.likes[sender]) {
      delete obj.likes[sender];
    } else {
      obj.likes[sender] = {};
      obj.likes[sender].type = type;
    }
    proposes[memoIndex] = obj;

    setProposes(proposes)

    // const log = Object.assign({}, like, { index });
    // this.emitEvent('addLike', { by: msg.sender, log }, ['by']);
  }

  @view getLikeByProIndex(proIndex: number) {
    const obj = getDataByIndex(this.proposes, proIndex);
    return obj.likes;
  }

  @transaction acceptPropose(proIndex: number, r_content: string) {
    this._confirmPropose(proIndex, r_content, 1);
    const obj = getDataByIndex(this.proposes, proIndex);
    obj.memoryRelationIndex = this.addMemory(proIndex, false, '', { hash: [], date: Date.now() }, 1);
  }

  @transaction cancelPropose(proIndex: number, r_content: string) {
    this._confirmPropose(proIndex, r_content, 2);
  }

  @view getProposeByAddress(address) {
    if (address === 'undefined') address = msg.sender;
    const arrPro = this.add2p[address] || [];
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
  @transaction addMemory(proIndex: number, isPrivate: boolean, content: string, info, type = 0) {
    let pro = getDataByIndex(this.proposes, proIndex);
    expect(msg.sender === pro.receiver || msg.sender === pro.sender, "Can't add memory. You must be owner propose.");
    const sender = msg.sender;
    let menory = { isPrivate, sender, proIndex, content, info, type, likes: {}, comments: [] };
    //new memories
    if (type === 1) {
      menory = Object.assign({}, menory, { receiver: pro.sender });
    }
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
    this.proposes[proIndex] = pro;
    //emit Event
    const log = Object.assign({}, menory, { id: index });
    this.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
    return index;
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
    const log = { memoIndex };
    this.emitEvent('addLike', { by: msg.sender, memoIndex, log }, ['by', 'memoIndex']);
  }

  @view getLikeByMemoIndex(memoIndex: number) {
    const obj = getDataByIndex(this.memories, memoIndex);
    return obj.likes;
  }
  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const sender = msg.sender;
    let obj = getDataByIndex(this.memories, memoIndex);
    const newblock = block;
    const timestamp = Date.now();
    const comment = { sender, content, info, timestamp, newblock };
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
    const log = Object.assign({}, this.proposes[index], { id: index });
    this.emitEvent('confirmPropose', { by: sender, log }, ['by']);
  }

  @transaction changeCoverImg(index: number, coverImg: string) {
    let pro = getDataByIndex(this.proposes, index);
    const sender = msg.sender;
    expect(sender === pro.receiver || sender === pro.sender, 'Permission deny. Can not change.');

    pro = Object.assign({}, pro, { coverImg });
    this.proposes[index] = pro;

    //emit Event
    const log = Object.assign({}, pro, { id: index });
    this.emitEvent('changeCoverImg', { by: sender, log }, ['by']);
  }
}
