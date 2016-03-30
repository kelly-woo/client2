/**
 * @fileoverview 사용자 List Singleton 모델
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('UserList', UserList);

  /* @ngInject */
  function UserList(CoreUtil, EntityCollection) {

    var UserListClass = CoreUtil.defineClass(EntityCollection, /**@lends EntityCollection.prototype */{
      /**
       * 생성자
       */
      init: function() {
        EntityCollection.prototype.init.apply(this, arguments);
      },

      /**
       * 상태가 enable 인 사용자 list 를 반환한다.
       * @returns {Array}
       */
      getEnabledList: function() {
        return _.filter(this.toJSON(true), function(user) {
          return user.status == 'enabled';
        });
      },

      /**
       * userId 에 해당하는 chatRoom id 를 반환한다.
       * @param {number|string} userId
       * @returns {*}
       */
      getChatRoomId: function(userId) {
        var user = this.get(userId);
        return CoreUtil.pick(user, 'entityId');
      }
    });

    return new UserListClass();
  }
})();
