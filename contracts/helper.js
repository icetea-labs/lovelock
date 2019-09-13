//private function
exports._isOwnerPropose = (propose, message: string) => {
  const errmsg = message + ' You must be owner propose.';
  expect(msg.sender === propose.receiver || msg.sender === propose.sender, errmsg);
};
//private function
exports._getDataByIndex = (array, index) => {
  const data = array[index];
  expect(!!data, 'The array index out of bounds');
  return data;
};
