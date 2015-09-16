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

    function lock() {
      if (!_isLock) {
        _isLock = true;
        jndPubSub.pub('topic-update-lock', _isLock);
      }
    }

    function unlock() {
      if (_isLock) {
        _isLock = false;
        jndPubSub.pub('topic-update-lock', _isLock);
      }
    }

    function isLocked() {
      return _isLock;
    }
  }
})();
