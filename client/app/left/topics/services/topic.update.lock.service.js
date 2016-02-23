/**
 * @fileoverview Topic Update Lock 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicUpdateLock', TopicUpdateLock);

  /* @ngInject */
  function TopicUpdateLock(jndPubSub) {
    var _isLock = false;

    this.isLocked = isLocked;
    this.lock = lock;
    this.unlock = unlock;

    /**
     * lock 을 설정한다.
     */
    function lock() {
      if (!_isLock) {
        _isLock = true;
        jndPubSub.pub('TopicUpdateLock:change', _isLock);
      }
    }

    /**
     * lock 을 해제한다.
     */
    function unlock() {
      if (_isLock) {
        _isLock = false;
        jndPubSub.pub('TopicUpdateLock:change', _isLock);
      }
    }

    /**
     * 현재 lock 상태를 반환한다.
     * @returns {boolean}
     */
    function isLocked() {
      return _isLock;
    }
  }
})();
