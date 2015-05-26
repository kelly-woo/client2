(function() {

  'use strict';

  angular
    .module('jandiApp')
    .controller('headerCtrl',headerCtrl);

  /* @ngInject */
  function headerCtrl($scope, $rootScope, $state, $stateParams, $filter, $modal, accountService, memberService, publicService, configuration, language, modalHelper) {
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

    modalMap = {
      'agreement': function() {
        publicService.openAgreementModal();
      },
      'privacy': function() {
        publicService.openPrivacyModal();
      },
      'channel': function() {
        publicService.openTopicCreateModal($scope);
      },
      'private': function() {
        publicService.openPrivateCreateModal($scope);
      },
      'invite': function() {
        publicService.openInviteToTeamModal($scope);
      },
      'team-change': function() {
        publicService.openTeamChangeModal($scope);
      },
      'setting-team': function() {
        publicService.openTeamSettingModal($scope);
      },
      'team-member': function() {
        modalHelper.openTeamMemberListModal();
      },
      'setting-profile': function() {
        $modal.open({
          scope       :   $scope,
          templateUrl :   'app/modal/settings.profile.html',
          controller  :   'profileCtrl',
          size        :   'lg'
        });
      },
      'setting-account': function() {
        $modal.open({
          scope       :   $scope,
          templateUrl :   'app/modal/settings.account.html',
          controller  :   'accountController',
          size        :   'lg'
        });
      },
      'setting-service': function() {
        $modal.open({
          sopce       : $scope,
          templateUrl : 'app/modal/settings.service.html',
          controller  : 'preferencesController',
//        windowClass : 'modal-wide',
          size        : 'lg'
        });
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

    $scope.onRightPanelToggle = function() {
      if (_isRpanelVisible()) {
        $state.go('messages.detail');
      } else {
        var viewport = $('.msgs');
        var content = $('.msgs-holder');

        // scroll to bottom
        if (viewport.scrollTop() + viewport.height() >= content.height()) {
          setTimeout(function() {
            viewport.animate({scrollTop: content.height()}, 200);
          });
        }

        $state.go('messages.detail.files');
      }
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
