const { expect } = require(";");

@contract class Propose {
  @view @state propose = [];
  @view @state addressToPropose = {};//1:n

  @view @state memories = [];
  @view @state proposeToMemories = {}; //1:n
  @view @state memoryToPropose = {}; //1:1

  @view @state comments = [];
  @view @state memoryToComments = {};//1:n
  //info { img:Array, location:string, date:string }
  @transaction createPropose(s_content: string, receiver: string, info: string) {
    const sender = msg.sender
    const isPrivate = false;
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    const pendingPropose = { sender, s_content, receiver, status: 0, info, isPrivate }

    //new pending propose
    const x = this.propose
    const index = x.push(pendingPropose) - 1
    this.propose = x

    //map address to propose
    const y = this.addressToPropose
    if (!y[sender]) y[sender] = []
    y[sender].push(index)
    this.addressToPropose = y

    //emit Event
    const log = Object.assign({}, pendingPropose, { index })
    this.emitEvent("createPropose", { by: sender, log }, ["by"]);
  }

  @transaction acceptPropose(proIndex: number, r_content: string) {
    this.confirmPropose(proIndex, r_content, 1)
  }

  @transaction cancelPropose(proIndex: number, r_content: string) {
    this.confirmPropose(proIndex, r_content, 2)
  }

  //private function
  confirmPropose(index: number, r_content: string, status: number) {
    const pendingPropose = this.propose[index]
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    if (status === 1) {
      expect(msg.sender === pendingPropose.receiver, "Can't accept propose. You must be receiver.")
    } else {
      expect(msg.sender === pendingPropose.receiver || msg.sender === pendingPropose.sender, "You can't update propose. You must be owner propose.")
    }
    const propose = Object.assign({}, pendingPropose, { r_content, status })
    this.propose[index] = propose

    //emit Event
    const log = Object.assign({}, propose, { index })
    this.emitEvent("confirmPropose", { by: msg.sender, log }, ["by"]);
  }

  // Change info { img:Array, location:string, date:string }
  @transaction changeInfoPromise(index: number, info: string) {
    const propose = this.propose[index]
    expect(msg.sender === propose.receiver || msg.sender === propose.sender, "Can't change info promise. You must be owner propose.")
    this.propose[index] = Object.assign({}, propose, { info })

    //emit Event
    const log = Object.assign({}, propose, { index, info })
    this.emitEvent("changeInfoPromise", { by: msg.sender, log }, ["by"]);
  }
  // change privacy propose (public or private)
  @transaction changePrivacy(proIndex: number, isPrivate: bool) {
    const propose = this.propose[proIndex]
    this.propose[index] = Object.assign({}, propose, { isPrivate })
    //emit Event
    const log = Object.assign({}, propose, { proIndex, isPrivate })
    this.emitEvent("changePrivacy", { by: msg.sender, log }, ["by"]);
  }
  // info { img:Array, location:string, date:string }
  @transaction addMemory(proIndex: number, content: string, info: string) {
    const propose = this.propose[proIndex]
    expect(msg.sender === propose.receiver || msg.sender === propose.sender, "Can't add memory. You must be owner propose.")

    //new memories
    const menory = { proIndex, content, info }
    const x = this.memories
    const index = x.push(menory) - 1
    this.memories = x

    //map index propose to index memory
    const y = this.proposeToMemories
    if (!y[proIndex]) y[proIndex] = []
    y[proIndex].push(index)
    this.proposeToMemories = y

    //map index memory to index propose
    const z = this.memoryToPropose
    z[index] = proIndex
    this.memoryToPropose = z

    //emit Event
    const log = Object.assign({}, menory, { index })
    this.emitEvent("addMemory", { by: msg.sender, log }, ["by"]);
  }

  // create comment for memory
  @transaction addComment(memoIndex: number, content: string, info: string) {
    const proIndex = this.memoryToPropose[memoIndex]
    const propose = this.propose[proIndex]
    expect(msg.sender === propose.receiver || msg.sender === propose.sender, "Can't add comment. You must be owner propose.")

    //new memories
    const comment = { memoIndex, content, info }
    const x = this.comments
    const index = x.push(comment) - 1
    this.comments = x

    //map index propose to index memory
    const y = this.memoryToComments
    if (!y[memoIndex]) y[memoIndex] = []
    y[memoIndex].push(index)
    this.memoryToComments = y

    //emit Event
    const log = Object.assign({}, comment, { index })
    this.emitEvent("addComment", { by: msg.sender, log }, ["by"]);
  }
}
