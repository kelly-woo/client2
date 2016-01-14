/**
 * @fileoverview extract mention spec
 */
(function() {
  'use strict';

  describe('jnd.util.service', function () {
    var JndUtil;


    beforeEach(module('jandiApp'));
    beforeEach(inject(function (_JndUtil_) {
      JndUtil = _JndUtil_;
    }));

    describe('pick', function() {
      it('기본 검증', function() {
        var o1,
          o2 = null;

        expect(JndUtil.pick(o1)).toBeUndefined();
        expect(JndUtil.pick(o1, 'key1')).toBeUndefined();
        expect(JndUtil.pick(o2)).toBeNull();
        expect(JndUtil.pick(o2, 'key1')).toBeUndefined();
        expect(JndUtil.pick(o2, 'key1', 'key2')).toBeUndefined();

        expect(JndUtil.pick(1)).toBe(1);
        expect(JndUtil.pick('key1')).toBe('key1');
        expect(JndUtil.pick('key1', 'key2')).toBeUndefined();
      });
      it('Object 인 경우', function() {
        var obj = {
          'key1': 1,
          'nested' : {
            'key1': 11,
            'nested': {
              'key1': 21
            }
          }
        };

        expect(JndUtil.pick(obj, 'key1')).toBe(1);
        expect(JndUtil.pick(obj, 'nested')).toEqual(obj.nested);
        expect(JndUtil.pick(obj, 'nested', 'key1')).toBe(11);
        expect(JndUtil.pick(obj, 'nested', 'nested')).toBe(obj.nested.nested);
        expect(JndUtil.pick(obj, 'nested', 'nested', 'key1')).toBe(21);

        expect(JndUtil.pick(obj, 'notFound')).toBeUndefined();
        expect(JndUtil.pick(obj, 'notFound', 'notFound')).toBeUndefined();

      });
      it('배열인 경우', function() {
        var arr = [1, [2], {'key1': 3}];

        expect(JndUtil.pick(arr, 0)).toBe(1);
        expect(JndUtil.pick(arr, 1)).toBe(arr[1]);
        expect(JndUtil.pick(arr, 1, 0)).toBe(2);
        expect(JndUtil.pick(arr, 2, 'key1')).toBe(3);

        expect(JndUtil.pick(arr, 5)).toBeUndefined();
      });
    });
  });
})();
