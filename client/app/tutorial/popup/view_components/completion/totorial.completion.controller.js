/**
 * @fileoverview 튜토리얼 completion 모달 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialCompletionCtrl', function ($scope, $rootScope, $filter, jndPubSub, TutorialAccount) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      var account;
      var currentTeam;
      TutorialAccount.promise.then(function() {
        account = TutorialAccount.getCurrent();
        currentTeam = TutorialAccount.getCurrentTeam();
        $scope.title = _translate('@tutorial_congratulations').replace('{{username}}', account.name);
        $scope.content = _translate('@tutorial_congratulations_content').replace('{{teamName}}', currentTeam.name);
      });
    }

    /**
     * 번역한 결과를 반환한다.
     * @param {string} key
     * @returns {*}
     * @private
     */
    function _translate(key) {
      return $filter('translate')(key);
    }
  });
})();
