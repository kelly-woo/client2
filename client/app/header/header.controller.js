(function() {

  'use strict';

  angular
    .module('jandiApp')
    .controller('headerCtrl',headerCtrl);

  /* @ngInject */
  function headerCtrl($scope, $rootScope, $state, $stateParams, $filter, $modal, accountService,
                      memberService, publicService, configuration, language, modalHelper) {
    var modalMap;
    var modalOpenMap;

    (function() {
      _initRightPanelButtonLabel();
      $scope.languageList = language.getLanguageList();
    })();

    var stateParams;
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      _initRightPanelButtonLabel();
      stateParams = toParams;
    });



    $scope.onLanguageClick = onLanguageClick;

    function onLanguageClick(lang) {
      if (accountService.getAccountLanguage() == lang) return;

      var languageObj = {
        lang: lang
      };

      accountService.setAccountInfo(languageObj)
        .success(function(response) {
          accountService.setAccountLanguage(response.lang);
          publicService.getLanguageSetting(accountService.getAccountLanguage());
          publicService.setCurrentLanguage();

          _reloadCurrentPage($state.current, stateParams);

        })
        .error(function(err) {
          console.log(err)
        })
        .finally(function() {
        })
    }

    function _reloadCurrentPage(state, stateParams) {
      // 현재 state 다시 로드
      $state.transitionTo(state, stateParams, {
        reload: true,
        inherit: false,
        notify: true
      });

    }

    $scope.toAdmin = function() {
      var teamName = $filter('getName')($scope.team);
      publicService.redirectTo(configuration.main_address + 'admin/' + teamName);
    };
    $scope.toTeam = function() {
      publicService.redirectTo(configuration.main_address + 'team');
    };
    $scope.onSignOutClick =function() {
      publicService.signOut();
    };


    modalMap = {
      'agreement': function() {
        modalHelper.openAgreementModal();
      },
      'privacy': function() {
        modalHelper.openPrivacyModal();
      },
      'channel': function() {
        modalHelper.openTopicCreateModal($scope);
      },
      'invite': function() {
        modalHelper.openInviteToTeamModal($scope);
      },
      'team-change': function() {
        modalHelper.openTeamChangeModal($scope);
      },
      'team-member': function() {
        modalHelper.openTeamMemberListModal();
      }
    };
    $scope.openModal = function(selector) {
      var fn;

      (fn = modalMap[selector]) && fn();
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

  }


})();
