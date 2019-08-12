const { expect } = require(";");

@contract class Propose {
  @view @state propose = [];
  @view @state addressToPropose = {};

  //info { img:Array, location:string, date:string }
  @transaction createPropose(s_content: string, receiver: string, info: string) {
    const sender = msg.sender
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    let pendingPropose = { sender, s_content, receiver, status: 0, info }

    //new memories
    const x = this.propose
    const index = x.push(pendingPropose) - 1
    this.propose = x

    // new map address to propose
    const y = this.addressToPropose
    if (!y[sender]) y[sender] = []
    y[sender].push(index)
    this.addressToPropose = y

    //emit Event
    pendingPropose = Object.assign({}, pendingPropose, { index })
    this.emitEvent("createPropose", { by: sender, pendingPropose }, ["by"]);
  }

  @transaction acceptPropose(index: number, r_content: string) {
    this.confirmPropose(index, r_content, 1)
  }

  @transaction cancelPropose(index: number, r_content: string) {
    this.confirmPropose(index, r_content, 2)
  }
  //private function
  confirmPropose(index: number, r_content: string, status: number) {
    let propose = this.propose[index]
    // status: pending: 0, accept_propose: 1, cancel_propose: 2
    if (status === 1) {
      expect(msg.sender === propose.receiver, "Can't accept propose. You must be receiver.")
    } else {
      expect(msg.sender === propose.receiver || msg.sender === propose.sender, "You can't update propose. You must be owner propose.")
    }
    propose = Object.assign({}, propose, { r_content, status })
    this.propose[index] = propose

    //emit Event
    this.emitEvent("confirmPropose", { by: msg.sender, propose }, ["by"]);
  }
  // Change info { img:Array, location:string, date:string }
  @transaction changeInfoPromise(index: number, info: string) {
    let propose = this.propose[index]
    expect(msg.sender === propose.receiver || msg.sender === propose.sender, "Can't change info promise. You must be owner propose.")
    propose = Object.assign({}, propose, { info })
    this.propose[index] = propose
  }
}
