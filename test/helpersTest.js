const { assert } = require('chai');

const { fetchUserData } = require('../helper_functions');

const testUsers = {
  ibrik96: {
    id: 'ibrik96',
    email: 'ibrahim@khalilov.com',
    password: 'ibrik96',
  },
  nijat12: {
    id: 'nijat11',
    email: 'nijat11@gmail.com',
    password: 'nijat11',
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
    console.log('res');
    console.log(res);
    assert.equal(res.id, expectedOutput.id);
    assert.equal(res.email, expectedOutput.email);
    assert.equal(res.password, expectedOutput.password);
  });

  it('should return a user with valid email', function () {
    const res = fetchUserData('nijat11@gmail.com', testUsers);
    const expectedOutput = {
      id: 'nijat11',
      email: 'nijat11@gmail.com',
      password: 'nijat11',
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
