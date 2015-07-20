/**
 * @fileoverview Tutorial 의 account 정보 저장한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialAPI', TutorialAPI);

  /* @ngInject */
  function TutorialAPI($http, configuration) {
    var SERVER_ADDRESS = configuration.server_address;

    this.set = set;

    function set(step, isComplete) {
      return $http({
        method  : 'PUT',
        url     : SERVER_ADDRESS + 'settings/tutorial',
        data    : {
          tutorialStep: step,
          tutorialConfirm: isComplete
        }
      });
    }
  }
})();
