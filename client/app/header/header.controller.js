(function() {

  'use strict';

  angular
    .module('jandiApp')
    .controller('headerCtrl',headerCtrl);

  /* @ngInject */
  function headerCtrl($scope, $rootScope, $state, accountService, pcAppHelper,
                      memberService, publicService, configuration,
                      language, modalHelper, jndPubSub, DeskTopNotificationBanner,
                      Browser, AnalyticsHelper, Router) {
    var modalMap;
    var stateParams;
    var currentRightPanel;

    _init();

    function _init() {
      $rootScope.isOpenRightPanel = _getIsOpenRightPanel();

      DeskTopNotificationBanner.showNotificationBanner($scope);

      $scope.languageList = language.getLanguageList();
      $scope.isIe = Browser.msie;

      $scope.toolbar = {
        files: false,
        messages: false,
        stars: false,
        mentions: false
      };

      if (currentRightPanel = Router.getActiveRightTabName($state.current)) {
        $scope.toolbar[currentRightPanel] = true;
      }
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      stateParams = toParams;
    });

    $scope.$on('onActiveHeaderTab', function($event, type) {
      _setTabStatus(currentRightPanel, false);
      _setTabStatus(type, true);
    });

    $scope.$on('onRightPanel', function($event, type) {
      $rootScope.isOpenRightPanel = true;

      _setTabStatus(currentRightPanel, false);
      _setTabStatus(type, true);
    });

    $scope.$on('closeRightPanel', function() {
      _closeRightPanel();
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
      publicService.redirectTo(configuration.main_address + 'team');
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
      //@fixme: remove old tutorial logic
      if (pcAppHelper.isPcApp()) {
        jndPubSub.pub('initTutorialStatus');
      } else {
        jndPubSub.pub('tutorial:open');
      }
    };

    $scope.onTutorialPulseClick = function($event) {
      jndPubSub.pub('onTutorialPulseClick', $event);
    };

    $scope.openRightPanel = function(type) {
      if ($scope.toolbar[type] && currentRightPanel === type) {
        _closeRightPanel();
      } else {
        _autoScroll();
        _setTabStatus(currentRightPanel, false);

        $state.go('messages.detail.' + type);
      }
    };

    function _autoScroll() {
      var viewport = $('.msgs');
      var content = $('.msgs-holder');

      // scroll to bottom
      if (viewport.scrollTop() + viewport.height() >= content.height()) {
        setTimeout(function() {
          viewport.animate({scrollTop: content.height()}, 200);
        });
      }
    }

    function _setTabStatus(type, value) {
      $scope.toolbar[type] = value;
      currentRightPanel = type;
    }

    function _closeRightPanel() {
      $rootScope.isOpenRightPanel = false;

      $scope.toolbar[currentRightPanel] = false;
      currentRightPanel = null;
      $state.go('messages.detail');
    }

    /**
     * right panel open 여부를 전달함
     * @returns {boolean}
     * @private
     */
    function _getIsOpenRightPanel() {
      return /files|messages|stars|mentions/.test($state.current.url);
    }
  }
})();
