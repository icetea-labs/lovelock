//private function
exports.isOwnerPropose = (propose, message) => {
  const errmsg = message + ' You must be owner propose.';
  expect(msg.sender === propose.receiver || msg.sender === propose.sender, errmsg);
};
//private function
exports.getDataByIndex = (array, index) => {
  const data = array[index];
  expect(!!data, 'The array index out of bounds');
  return data;
};
