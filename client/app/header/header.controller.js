'use strict';

var app = angular.module('jandiApp');

app.controller('headerController', function($scope, $rootScope, $state, $filter, $modal, authAPIservice, memberService, publicService, configuration) {
  //console.info('[enter] headerController');

  (function() {
    _initRightPanelButtonLabel();
  })();

  $scope.$on('$stateChangeSuccess', function() {
    _initRightPanelButtonLabel();
  });




  //  Called when header dropdown is clicked.
  //  Setting fileTypeQuery to clicked value.
  //  If right panel is not opened yet, open it first.
  //  right.controller is listening to 'updateFileTypeQuery'.
  $scope.onFileTypeClick = function(type) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileTypeQuery', type);
    $rootScope.$broadcast('setFileTabActive');
  };
  //  right controller is listening to 'updateFileWriterId'.
  $scope.onFileListClick = function(userId) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileWriterId', userId);
  };



  $scope.toAdmin = function() {
    var teamName = $filter('getName')($scope.team)
    publicService.redirectTo(configuration.main_address + 'admin/' + teamName);
  };
  $scope.toTeam = function() {
    publicService.redirectTo(configuration.main_address + 'team');
  };
  $scope.onSignOutClick =function() {
    publicService.signOut();
  };
  $scope.openModal = function(selector) {
    switch(selector) {
      case 'agreement':
        publicService.openAgreementModal();
        break;
      case 'privacy':
        publicService.openPrivacyModal();
        break;
      case 'channel':
        publicService.openTopicCreateModal($scope);
        break;
      case 'private':
        publicService.openPrivateCreateModal($scope);
        break;
      case 'invite':
        publicService.openInviteToTeamModal($scope);
        break;
      case 'teamChange':
        publicService.openTeamChangeModal($scope);
        break;
      case 'setting-team':
        publicService.openTeamSettingModal($scope);
        break;
      default:
        break;
    }


    if (selector == 'setting-profile') {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/settings.profile.html',
        controller  :   'profileCtrl',
        size        :   'lg'
      });
    }
    else if (selector == 'setting-account') {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/settings.account.html',
        controller  :   'accountController',
        size        :   'lg'
      });
    }
    else if (selector === 'setting-service') {
      $modal.open({
        sopce       : $scope,
        templateUrl : 'app/modal/settings.service.html',
        controller  : 'preferencesController',
//                windowClass : 'modal-wide',
        size        : 'lg'
      });
    }
  };
  $scope.toggleLoading = function() {
    $scope.isLoading = !$scope.isLoading;
  };
  $scope.isUserAuthorized = function() {
    return memberService.isAuthorized($scope.user);
  };

  $scope.onShowTutorialClick = function() {
    $rootScope.$broadcast('initTutorialStatus');
  };
  $scope.onTutorialPulseClick = function($event) {
    $rootScope.$broadcast('onTutorialPulseClick', $event);
  };

  $scope.onToggleClick = function() {
    if (_isRpanelVisible()) {
      $state.go('messages.detail');
      return;
    }
    $state.go('messages.detail.files');
  };

  function _initRightPanelButtonLabel() {
    $scope.isRpanelVisible = _isRpanelVisible();

    if ($scope.isRpanelVisible) {
      $scope.rPanelButtonLabel = $filter('translate')('@btn-close');
    } else {
      $scope.rPanelButtonLabel = $filter('translate')('@common-search');
    }
  }
  function _isRpanelVisible() {
    return $state.includes('**.files.**');
  }

});
