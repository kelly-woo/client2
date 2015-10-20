/**
 *
 *        TODO: PLEASE MOVE EVERYTHING THAT IS RELATED TO 'MODAL' TO 'modal.service.js'
 *         4/9/2015 JiHoon
 *
 */
(function() {
  angular
    .module('jandiApp')
    .factory('publicService', publicService);

  /* @ngInject */
  function publicService($rootScope, accountService, storageAPIservice, jndWebSocket, jndPubSub,
                         currentSessionHelper, $state, analyticsService, tutorialService, language,
                         entityAPIservice, HybridAppHelper, $filter, memberService, configuration) {
    var _isInit = false;
    var service = {
      getInviteOptions: getInviteOptions,
      openTutorialModal: openTutorialModal,
      closeModal: closeModal,
      setLanguageConfig: setLanguageConfig,
      setDebugMode: setDebugMode,
      signOut: signOut,
      getBrowserInfo: getBrowserInfo,
      redirectTo: redirectTo,
      redirectToMain: redirectToMain,
      isDisabledMember: isDisabledMember,
      isNullOrUndefined: isNullOrUndefined,
      goToDefaultTopic: goToDefaultTopic,
      adjustBodyWrapperHeight: adjustBodyWrapperHeight,
      hideTransitionLoading: hideTransitionLoading,
      showTransitionLoading: showTransitionLoading,
      reloadCurrentPage: reloadCurrentPage,
      openNewTab: openNewTab,
      setInitDone: setInitDone,
      isInitDone: isInitDone
    };

    return service;

    function getInviteOptions(joinedChannelList, privateGroupList, inviteeId) {
      var list = [];

      angular.forEach(joinedChannelList, function(entity, index) {
        if (!_.contains(entity.ch_members, inviteeId))
          this.push(entity);
      }, list);

      angular.forEach(privateGroupList, function(entity, index) {
        if (!_.contains(entity.pg_members, inviteeId))
          this.push(entity);
      }, list);

      return $filter('orderBy')(list, 'name');
    }

    function openTutorialModal(tutorialId) {
      var modal;

      switch (tutorialId) {
        case 'welcomeTutorial':
          modal = tutorialService.openWelcomeModal();
          break;
        case 'topicTutorial':
          modal = tutorialService.openTopicModal();
          break;
        case 'chatTutorial' :
          modal = tutorialService.openChatModal();
          break;
        case 'fileTutorial' :
          modal = tutorialService.openFileModal();
          break;
        default :
          break;
      }

      return modal;
    }

    function closeModal(modalInstance) {
      modalInstance.dismiss('close');
    }

    // Browser/OS may give us slightly different format for same language.
    // In such case, we reformat the language variable so that we can notify 'server' and 'translator' with correct language format.
    function setLanguageConfig(curLang) {
      language.setConfig(curLang);
    }

    // Setting debug mode for translator, nggettext
    function setDebugMode(isDebug) {
      language.setDebugMode(isDebug);
    }

    function signOut() {
      // There is no need to remove session storage, but still just in case.
      currentSessionHelper.clear();
      storageAPIservice.removeSession();
      storageAPIservice.removeLocal();
      storageAPIservice.removeCookie();

      analyticsService.removeMemberCookieMixpanel();
      analyticsService.removeAccountCookieMixpanel();

      accountService.removeAccount();

      // Disconnect socket connection.
      jndWebSocket.disconnectTeam();

      // PC app function.
      HybridAppHelper.onSignedOut();

      if ( $state.current.name == 'signin') {
        // 현재 state 다시 로드
        $state.transitionTo($state.current, {}, {
          reload: true,
          inherit: false,
          notify: true
        });
      }
      else {
        $state.go('signin');
      }
    }

    function getBrowserInfo() {
      $rootScope.isMobile = jQuery.browser.mobile;

      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      $rootScope.isAndroid = userAgent.match(/Android/i)=='Android';
    }
    function redirectTo(url) {
      // Direct to 'url'.
      location.href = url;
    }
    function redirectToMain() {
      redirectTo(configuration.main_address + 'team');
    }

    /**
     * member가 enable status 가 아니면 true를 리턴한다.
     * @param {number|object} member - 찾으려는 member
     * @returns {*}
     */
    function isDisabledMember(member) {
      if (member == null) {
        return false;
      }

      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member);
      } else if (!member.status) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member.id);
      }

      return memberService.isDeactivatedMember(member);
    }

    function _isNumber(obj) {
      return typeof obj == 'number';
    }

    function isNullOrUndefined(value) {
      return typeof value === 'undefined' || value === null || angular.isUndefined(value);
    }

    function goToDefaultTopic() {
      $state.go('archives', {entityType:'channels',  entityId:currentSessionHelper.getDefaultTopicId() });
    }

    /**
     * 배너의 유무를 판단하여 '.body' 와 '.body-wrapper' 의 높이를 조절한다.
     * 기본값은 $(window).height() 이지만 배너가 있다면 배너의 높이만큼 작아저야 한다.
     * @param isBannerUp
     */
    function adjustBodyWrapperHeight(isBannerUp) {
      var bodyWrapperHeight;

      var jqBodyWrapper = $('.body-wrapper');
      var jqBody = $('.body');

      var BANNER_HEIGHT = 40;
      var HEADER_HEIGHT = 40;

      var heightOffset = isBannerUp ? BANNER_HEIGHT : 0;

      bodyWrapperHeight = $(window).height() - heightOffset;

      jqBodyWrapper.height(bodyWrapperHeight);
      jqBody.height(bodyWrapperHeight - HEADER_HEIGHT);
    }

    function hideTransitionLoading() {
      $rootScope.isReady = true;
      jndPubSub.pub('hideDefaultBackground');
    }

    function showTransitionLoading() {
      $rootScope.isReady = false;
    }

    /**
     * data initialize 가 완료 되었음을 설정한다
     */
    function setInitDone() {
      if (!_isInit) {
        _isInit = true;
        jndPubSub.pub('dataInitDone');
      }
    }

    /**
     * initialize 가 완료 되었는지 여부를 반환한다
     * @returns {boolean}
     */
    function isInitDone() {
      return _isInit;
    }

    /**
     * current page reload
     * @param {object} currentState
     * @param {object} params
     */
    function reloadCurrentPage(currentState, params) {
      //TODO: 현재 transitionTo 를 사용 시 profile modal 및 center panel L10N 이 제대로 설정되지 않아 location.reload 를 사용함.
      // 현재 state 다시 로드
      //$state.transitionTo(currentState, params, {
      //  reload: true,
      //  inherit: false,
      //  notify: true
      //});
      window.location.reload();
    }

    function openNewTab(url) {
      var open_link = window.open('', '_blank');
      open_link.location.href = url;
    }
  }
})();
