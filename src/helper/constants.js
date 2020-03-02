const appConstants = {
  textByLockTypes: {
    lock: {
      messageLabel: 'Your Message',
      messagePlaceholder: 'Say something to your partner…',
      okButton: 'Send',
      sent: 'Lock sent'
    },
    crush: {
      messageLabel: 'Your Message',
      messagePlaceholder: 'Express yourself to your crush…',
      okButton: 'Create',
      sent: 'Lock created'
    },
    journal: {
      messageLabel: 'Journal Description',
      messagePlaceholder: 'My Amazing Blog',
      okButton: 'Create',
      sent: 'Journal created'
    }
  },
  memoryTypes: {
    systemGenerated: 1,
    manualGenerated: 0,
  },
  memoryPageSize: 5
};

export default appConstants;
