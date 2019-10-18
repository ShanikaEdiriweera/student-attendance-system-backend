const numberUtil = require('./numberUtil');

describe('numberUtil', () => {
  describe('generatePin()', () => {
    it('generates a pin with the length that is passed in', () => {
      const length = 5;
      const result = numberUtil.generatePin(length);
      expect(result.length).toEqual(5);
    });
  });
});