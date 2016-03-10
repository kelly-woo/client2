/**
 * @fileoverview
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('BotList', BotList);

  /* @ngInject */
  function BotList(Collection) {

    var _collection;
    var that = this;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      _collection =  new Collection({
        key: 'id'
      });

      that.setList = _collection.setList;
      that.add = _collection.add;
      that.remove = _collection.remove;
      that.reset = _collection.reset;
      that.get = _collection.get;
      that.remove = _collection.remove;
      that.toJSON= _collection.toJSON;
    }

  }
})();
