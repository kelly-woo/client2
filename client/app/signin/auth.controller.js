(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('authController', authController);

  /* @ngInject */
  function authController(Auth) {
    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      Auth.signIn();
    }
  }
})();
