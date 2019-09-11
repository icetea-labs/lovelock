const { expect } = require(';');

@contract
class Propose {
  @state propose = [];
  @state addressToPropose = {}; //1:n
  @state id = 0;

  @state memories = [];
  @state proposeToMemories = {}; //1:n
  @view @state memoryToPropose = {}; //1:1

  @view @state comments = [];
  @view @state memoryToComments = {}; //1:n
  //info { img:Array, location:string, date:string }
  @transaction createPropose(s_content: string, receiver: string, info: string) {
    const sender = msg.sender;
    const isPrivate = false;
    const id = this.id;

    expect(sender !== receiver, "Can't create owner propose.");

    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    const pendingPropose = { id, sender, s_content, receiver, status: 0, info, isPrivate };

    //new pending propose
    const x = this.propose;
    const index = x.push(pendingPropose) - 1;
    this.propose = x;

    //map address to propose
    const y = this.addressToPropose;
    if (!y[sender]) y[sender] = [];
    if (!y[receiver]) y[receiver] = [];
    y[sender].push(index);
    y[receiver].push(index);
    this.addressToPropose = y;

    //emit Event
    const log = Object.assign({}, pendingPropose, { index });
    this.emitEvent('createPropose', { by: sender, log }, ['by']);
    this.id = id + 1;
  }

  @transaction acceptPropose(proIndex: number, r_content: string) {
    this._confirmPropose(proIndex, r_content, 1);
  }

  @transaction cancelPropose(proIndex: number, r_content: string) {
    this._confirmPropose(proIndex, r_content, 2);
  }

  @view getProposeByAddress(address) {
    if (address === 'undefined') address = msg.sender;
    const arrPro = this._getDataByIndex(this.addressToPropose, address);
    let resp = [];
    arrPro.forEach(index => {
      const pro = this._getDataByIndex(this.propose, index);
      if (pro.isPrivate && (msg.sender === pro.sender || msg.sender === pro.receiver)) {
        resp.push(pro);
      } else {
        resp.push(pro);
      }
    });

    return resp;
  }

  @view getProposeByIndex(index: number) {
    const pro = this._getDataByIndex(this.propose, index);
    let resp = [];
    if (pro && pro.isPrivate) {
      this._isOwnerPropose(pro, "Can't get propose.");
    }
    resp.push(pro);
    return resp;
  }

  @view getMemoryByProIndex(proIndex: number) {
    const memoryPro = this._getDataByIndex(this.proposeToMemories, proIndex);
    let res = [];
    memoryPro.forEach(index => {
      const mem = this._getDataByIndex(this.memories, index);
      res.push(mem);
    });
    return res;
  }

  @view getMemoryByRange(start: number, end: number) {
    const allMem = this.memories;
    let i = 0;
    let res = [];
    if (end > allMem.length) end = allMem.length;
    for (i = start; i < end; i++) {
      if (!allMem[i].isPrivate) res.push(allMem[i])
    }
    return res;
  }

  // Change info { img:Array, location:string, date:string }
  @transaction changeInfoPropose(index: number, info: string) {
    const pro = this._getDataByIndex(this.propose, index);
    this._isOwnerPropose(pro, "You can't change propose info.");
    this.propose[index] = Object.assign({}, pro, { info });

    //emit Event
    const log = Object.assign({}, pro, { index, info });
    this.emitEvent('changeInfoPropose', { by: msg.sender, log }, ['by']);
  }
  // change privacy propose (public or private)
  @transaction changePrivacy(proIndex: number, isPrivate: boolean) {
    const pro = this._getDataByIndex(this.propose, index);
    this.propose[index] = Object.assign({}, pro, { isPrivate });
    //emit Event
    const log = Object.assign({}, pro, { index, isPrivate });
    this.emitEvent('changePrivacy', { by: msg.sender, log }, ['by']);
  }
  // info { img:Array, location:string, date:string }
  @transaction addMemory(proIndex: number, isPrivate: boolean, content: string, info: string) {
    const pro = this._getDataByIndex(this.propose, proIndex);
    expect(msg.sender === pro.receiver || msg.sender === pro.sender, "Can't add memory. You must be owner propose.");
    const sender = msg.sender;

    //new memories
    const menory = { proIndex, isPrivate, content, info, sender };
    const x = this.memories;
    const index = x.push(menory) - 1;
    this.memories = x;

    //map index propose to index memory
    const y = this.proposeToMemories;
    if (!y[proIndex]) y[proIndex] = [];
    y[proIndex].push(index);
    this.proposeToMemories = y;

    //map index memory to index propose
    const z = this.memoryToPropose;
    z[index] = proIndex;
    this.memoryToPropose = z;

    //emit Event
    const log = Object.assign({}, menory, { index });
    this.emitEvent('addMemory', { by: msg.sender, log }, ['by']);
  }

  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const proIndex = this._getDataByIndex(this.memoryToPropose, memoIndex);
    const pro = this._getDataByIndex(this.propose, proIndex);
    expect(msg.sender === pro.receiver || msg.sender === pro.sender, "Can't add comment. You must be owner propose.");

    //new memories
    const comment = { memoIndex, content, info };
    const x = this.comments;
    const index = x.push(comment) - 1;
    this.comments = x;

    //map index propose to index memory
    const y = this.memoryToComments;
    if (!y[memoIndex]) y[memoIndex] = [];
    y[memoIndex].push(index);
    this.memoryToComments = y;

    //emit Event
    const log = Object.assign({}, comment, { index });
    this.emitEvent('addComment', { by: msg.sender, log }, ['by']);
  }

  //private function
  _getDataByIndex(array, index) {
    const data = array[index];
    expect(!!data, 'The array index out of bounds');
    return data;
  }
  //private function
  _isOwnerPropose(propose, message: string) {
    const errmsg = message + ' You must be owner propose.';
    expect(msg.sender === propose.receiver || msg.sender === propose.sender, errmsg);
  }

  //private function
  _confirmPropose(index: number, r_content: string, status: number) {
    const sender = msg.sender;
    const pro = this._getDataByIndex(this.propose, index);
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    switch (status) {
      case 1:
        expect(sender === pro.receiver, "Can't accept propose. You must be receiver.");
        break;
      case 2:
        this._isOwnerPropose(pro, "You can't cancel propose.");
        break;
    }
    const x = Object.assign({}, pro, { r_content, status });
    this.propose[index] = x;

    //emit Event
    const log = Object.assign({}, pro, { index });
    this.emitEvent('confirmPropose', { by: sender, log }, ['by']);
  }
}
