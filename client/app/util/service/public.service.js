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
  function publicService($rootScope, $modal, accountService, storageAPIservice, jndWebSocket,
                         currentSessionHelper, $state, analyticsService, tutorialService, language,
                         entityAPIservice, pcAppHelper, modalHelper) {
    var service = {
      getInviteOptions: getInviteOptions,
      openTutorialModal: openTutorialModal,
      closeModal: closeModal,
      getLanguageSetting: getLanguageSetting,
      setCurrentLanguage: setCurrentLanguage,
      setDebugMode: setDebugMode,
      signOut: signOut,
      getBrowserInfo: getBrowserInfo,
      redirectTo: redirectTo,
      isDisabledMember: isDisabledMember,
      isNullOrUndefined: isNullOrUndefined,
      goToDefaultTopic: goToDefaultTopic,
      adjustBodyWrapperHeight: adjustBodyWrapperHeight,
      hideTransitionLoading: hideTransitionLoading,
      showTransitionLoading: showTransitionLoading
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

      return list;
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
    function getLanguageSetting(curLang) {
      language.getLanguageSetting(curLang);
    }

    // Setting language for translator, nggettext
    function setCurrentLanguage() {
      language.setCurrentLanguage();
    }
    // Setting debug mode for translator, nggettext
    function setDebugMode(isDebug) {
      language.setDebugMode(isDebug);
    }

    function signOut() {
      // There is no need to remove session storage, but still just in case.
      storageAPIservice.removeSession();
      storageAPIservice.removeLocal();
      storageAPIservice.removeCookie();

      analyticsService.removeMemberCookieMixpanel();
      analyticsService.removeAccountCookieMixpanel();

      accountService.removeAccount();

      // Disconnect socket connection.
      jndWebSocket.disconnectTeam();

      // PC app function.
      pcAppHelper.onSignedOut();

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

    function isDisabledMember(member) {
      if (member == null) {
        return false;
      }

      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member);
      } else if (!member.status) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member.id);
      }

      return member ? member.status === 'disabled' : true;
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
      var jqBody = $('.body');
      var jqBodyWrapper = $('.body-wrapper');

      var BANNER_HEIGHT = 40;
      var HEADER_HEIGHT = 40;

      var heightOffset = isBannerUp ? BANNER_HEIGHT : 0;

      jqBodyWrapper.height($(window).height() - heightOffset);
      jqBody.height($(window).height() - heightOffset - HEADER_HEIGHT);
    }


    function hideTransitionLoading() {
      $rootScope.isReady = true;
    }

    function showTransitionLoading() {
      $rootScope.isReady = false;
    }
  }
})();
