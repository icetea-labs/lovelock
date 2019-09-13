//private function
exports.isOwnerPropose = (propose, message, sender) => {
  const errmsg = message + ' You must be owner propose.';
  expect(sender === propose.receiver || sender === propose.sender, errmsg);
};
//private function
exports.getDataByIndex = (array, index) => {
  const data = array[index];
  expect(!!data, 'The array index out of bounds');
  return data;
};
