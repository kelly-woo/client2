(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('currentMemberCtrl', currentMemberCtrl);

  /* @ngInject */
  function currentMemberCtrl($scope, $filter, publicService, currentSessionHelper, memberService, modalHelper,
                             AnalyticsHelper) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.onCurrentMemberContainerClick = onCurrentMemberContainerClick;
      $scope.onSignOutClick = onSignOutClick;

      _setCurrentTeam();
      _setCurrentMember();

      _attachScopeEvents();
    }

    /**
     * attach scope events
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('onCurrentMemberChanged', _onCurrentMemberChanged)
    }

    /**
     * member container click event handler
     */
    function onCurrentMemberContainerClick() {
      modalHelper.openUserProfileModal($scope, memberService.getMember());
    }

    /**
     * sign out click event handler
     */
    function onSignOutClick() {
      //Analtics Tracker. Not Block the Process
      AnalyticsHelper.track(AnalyticsHelper.EVENT.SIGN_OUT);

      publicService.signOut();
    }

    /**
     * current member changed event handler
     * @private
     */
    function _onCurrentMemberChanged() {
      _setCurrentMember();
    }

    /**
     * set current team
     * @private
     */
    function _setCurrentTeam() {
      $scope.team = currentSessionHelper.getCurrentTeam();
    }

    /**
     * set current member
     * @private
     */
    function _setCurrentMember() {
      var member = memberService.getMember();

      $scope.image = $filter('getSmallThumbnail')(member);
      $scope.name = $filter('getName')(member);
      $scope.position = $filter('getUserPosition')(member);
    }
  }
})();
