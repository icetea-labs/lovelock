const { expect } = require(";");

@contract class Propose {
  @view @state propose = [];
  @view @state addressToPropose = {};

  @transaction createPropose(s_content: string, receiver: string, s_moreInfo: string) {
    const sender = msg.sender
    // status: 0 = memory, 1 = propose, 2: reject
    let menory = { sender, s_content, receiver, status: 0, moreInfo }

    //new memories
    const x = this.propose
    const index = x.push(menory) - 1
    this.propose = x

    // new map address to propose
    const y = this.addressToPropose
    if (!y[sender]) y[sender] = []
    y[sender].push(index)
    this.addressToPropose = y

    //emit Event
    menory = Object.assign({}, menory, { index })
    this.emitEvent("createPropose", { by: sender, menory }, ["by"]);
  }

  @transaction confirmPropose(index: number, r_content: string, status: number, r_moreInfo: string) {
    const sender = msg.sender
    let propose = this.propose[index]
    expect(sender !== propose.receiver, "User must be owner propose.")
    propose = Object.assign({}, propose, { r_content, status })
    this.propose[index] = propose

    //emit Event
    this.emitEvent("confirmPropose", { by: sender, propose }, ["by"]);
  }

}
