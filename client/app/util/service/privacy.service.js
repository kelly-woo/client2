/**
 * web_app에서 socket으로 일어나는 update들을 관리하기 위한 중앙 service
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Privacy', Privacy);

  /* @ngInject */
  function Privacy(jndPubSub) {
    var _isSet = false;
    this.set = set;
    this.unset = unset;
    this.is = is;


    function set() {
      _isSet = true;
      jndPubSub.pub('privacy:set');
    }

    function unset( ) {
      _isSet = false;
      jndPubSub.pub('privacy:unset');
    }

    function is() {
      return _isSet;
    }
  }
})();
