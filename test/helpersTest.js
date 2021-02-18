const { assert } = require('chai');

const { fetchUserData } = require('../helper_functions');

const testUsers = {
  ibrik96: {
    id: 'ibrik96',
    email: 'ibrahim@khalilov.com',
    password: 'ibrik96',
  },
  nijat12: {
    id: 'nijat12',
    email: 'nijat12@gmail.com',
    password: 'nijat12',
  },
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const res = fetchUserData('ibrahim@khalilov.com', testUsers);
    const expectedOutput = {
      id: 'ibrik96',
      email: 'ibrahim@khalilov.com',
      password: 'ibrik96',
    };
    // Write your assert statement here
    assert.equal(res.id, expectedOutput.id);
    assert.equal(res.email, expectedOutput.email);
    assert.equal(res.password, expectedOutput.password);
  });

  it('should return a user with valid email', function () {
    const res = fetchUserData('nijat12@gmail.com', testUsers);
    const expectedOutput = {
      id: 'nijat12',
      email: 'nijat12@gmail.com',
      password: 'nijat12',
    };
    assert.equal(res.id, expectedOutput.id);
    assert.equal(res.email, expectedOutput.email);
    assert.equal(res.password, expectedOutput.password);
  });

  it('should return undefined with an invalid email', function () {
    const res = fetchUserData('ibrahim@khalilov.com', testUsers);
    const expectedOutput = {
      id: 'userRandomID',
      email: 'user@example.com',
      password: 'purple-monkey-dinosaur',
    };
    assert.equal(res, undefined);
  });
});
