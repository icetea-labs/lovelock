//private function
exports.expectLockOwners = (lock, message = 'Permission denied') => {
  const errmsg = message + ': You must be owner of the lock.';
  expect(
    msg.sender === lock.receiver || msg.sender === lock.sender || lock.contributors.indexOf(msg.sender) !== -1,
    errmsg
  );
};
//private function
exports.getDataByIndex = (array, index) => {
  const data = array[index];
  expect(!!data, 'The array index (' + index + ') out of bounds ');
  return data;
};
