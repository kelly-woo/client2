/**
 * @fileoverview 사용자 List Model
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('UserList', UserList);

  /* @ngInject */
  function UserList(Collection) {
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

      that.getEnabledList = getEnabledList;
    }

    /**
     * 상태가 enable 인 사용자 list 를 반환한다.
     * @returns {Array}
     */
    function getEnabledList() {
      return _.filter(that.toJSON(true), function(user) {
        return user.status == 'enabled';
      });
    }
  }
})();
