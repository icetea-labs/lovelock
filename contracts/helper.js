//private function
exports.expectLockOwners = (lock, message = 'Permission denied') => {
  const errmsg = message + '. You must be owner of the lock.';
  expect(
    msg.sender === lock.receiver || msg.sender === lock.sender || lock.contributors.indexOf(msg.sender) !== -1,
    errmsg
  );
};
//private function
exports.expectOwner = (self, message = 'Permission denied') => {
  const errmsg = message + '. You must be owner.';
  const owner = self.getOwner();
  expect(owner.includes(msg.sender), errmsg);
};
//private function
exports.expectAdmin = (self, message = 'Permission denied') => {
  const errmsg = message + '. You must be user admin.';
  const admins = self.getAdmins();
  expect(admins.includes(msg.sender), errmsg);
};
//private function
exports.expectUserApproved = (self, message = 'Permission denied') => {
  const errmsg = message + '. You are not approved to use the app yet.';
  const users = self.getUsers();
  expect(users.includes(msg.sender), errmsg);
};
//private function
exports.getDataByIndex = (array, index) => {
  const data = array[index];
  expect(!!data, 'The array index (' + index + ') out of bounds ');
  return data;
};
