(function() {

  'use strict';

  angular
    .module('jandiApp')
    .controller('headerCtrl',headerCtrl);

  /* @ngInject */
  function headerCtrl($scope, $state, $filter, accountService,
                      memberService, publicService, configuration,
                      language, modalHelper, jndPubSub, DeskTopNotificationBanner,
                      Browser, AnalyticsHelper) {
    var modalMap;
    var stateParams;

    _init();

    function _init() {
      DeskTopNotificationBanner.showNotificationBanner($scope);

      _initRightPanelButtonLabel();
      $scope.languageList = language.getLanguageList();
      $scope.isIe = Browser.msie;
    }


    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      _initRightPanelButtonLabel();
      stateParams = toParams;
    });

    /**
     * language 변경 event handling
     */
    $scope.$on('changedLanguage', function() {
      _initRightPanelButtonLabel();
    });

    $scope.onLanguageClick = onLanguageClick;

    function onLanguageClick(lang) {
      var currentLang = accountService.getAccountLanguage();
      if (currentLang === lang) return;

      var languageObj = {
        lang: lang
      };

      accountService.setAccountInfo(languageObj)
        .success(function(response) {
          //Analtics Tracker. Not Block the Process
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.LANGUAGE_CHANGE, {
              'RESPONSE_SUCCESS': true,
              'PREVIOUS_LANGUAGE': currentLang,
              'CURRENT_LANGUAGE': lang
            });
          } catch (e) {
          }

          accountService.setAccountLanguage(response.lang);

          publicService.setLanguageConfig(accountService.getAccountLanguage());

          // language를 변경하게 되면 html에 content로 bind된 text는 변경이 되지만 '.js' file내
          // 변수로 선언된 text는 변경되지 않으므로 '.js' 재수행을 필요로 하므로 page를 reload함.
          publicService.reloadCurrentPage($state.current, stateParams);
        })
        .error(function(err) {
          console.log(err);
          //Analtics Tracker. Not Block the Process
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.LANGUAGE_CHANGE, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': err.code,
              'PREVIOUS_LANGUAGE': currentLang,
              'CURRENT_LANGUAGE': lang
            });
          } catch (e) {
          }

        })
        .finally(function() {
        })
    }

    $scope.toTeam = toTeam;

    /**
     * 잔디 메인으로 보내면서 팀 리스트 페이지를 연다.
     */
    function toTeam() {
      if ($scope.isConnected) {
        publicService.redirectTo(configuration.main_address + 'team');
      }
    }

    /**
     * 로그아웃 한다.
     */
    $scope.onSignOutClick = publicService.signOut;

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
      },
      'setting-notifications': function() {
        modalHelper.openNotificationSettingModal($scope);
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
      jndPubSub.pub('initTutorialStatus');
    };

    $scope.onTutorialPulseClick = function($event) {
      jndPubSub.pub('onTutorialPulseClick', $event);
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

    /**
     * right panel의 button translate 설정
     */
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
