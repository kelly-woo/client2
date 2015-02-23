(function() {
  angular
    .module('jandiApp')
    .factory('publicService', publicService);

  publicService.$inject = ['$rootScope', '$modal', 'accountService', 'storageAPIservice', 'memberService', 'gettextCatalog', '$state', 'analyticsService', 'tutorialService', 'language'];

  /* @ngInject */
  function publicService($rootScope, $modal, accountService, storageAPIservice, memberService, gettextCatalog, $state, analyticsService, tutorialService, language) {
    var service = {
      getInviteOptions: getInviteOptions,
      openTutorialModal: openTutorialModal,
      openPrivacyModal: openPrivacyModal,
      openAgreementModal: openAgreementModal,
      openJoinModal: openJoinModal,
      openTopicCreateModal: openTopicCreateModal,
      openPrivateCreateModal: openPrivateCreateModal,
      openInviteToTeamModal: openInviteToTeamModal,
      openCurrentMemberModal: openCurrentMemberModal,
      openInviteToCurrentEntityModal: openInviteToCurrentEntityModal,
      openInviteToJoinedEntityModal: openInviteToJoinedEntityModal,
      openMemberProfileModal: openMemberProfileModal,
      openPasswordResetRequestModal: openPasswordResetRequestModal,
      openFileUploadModal: openFileUploadModal,
      openTeamChangeModal: openTeamChangeModal,
      openTeamSettingModal: openTeamSettingModal,
      openTeamMemberListModal: openTeamMemberListModal,
      closeModal: closeModal,
      getLanguageSetting: getLanguageSetting,
      setCurrentLanguage: setCurrentLanguage,
      setDebugMode: setDebugMode,
      signOut: signOut,
      getBrowserInfo: getBrowserInfo,
      redirectTo: redirectTo
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

    function openPrivacyModal() {
      var privacy = 'app/modal/terms/privacy';
      privacy = privacy + '_' + accountService.getAccountLanguage() + '.html';

      $modal.open({
        templateUrl: privacy,
        size: 'lg'
      });
    }
    function openAgreementModal() {
      var agreement = 'app/modal/terms/agreement';
      agreement = agreement + '_' + accountService.getAccountLanguage() + '.html';

      $modal.open({
        templateUrl: agreement,
        size: 'lg'
      });
    }

    function openJoinModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/join.html',
        controller  :   'joinModalCtrl',
        size        :   'lg'
      });
    }
    function openTopicCreateModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/topic_create/topic.create.html',
        controller  :   'createEntityModalCtrl',
        size        :   'lg'
      });
    }
    function openPrivateCreateModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/create.private.html',
        controller  :   'createEntityModalCtrl',
        size        :   'lg'
      });
    }
    function openInviteToTeamModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/invite.team.html',
        controller  :   'inviteUserToTeamCtrl',
        size        :   'lg'
      });
    }
    function openCurrentMemberModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/settings.profile.html',
        controller  :   'profileCtrl',
        size        :   'lg'
      });
    }
    function openInviteToCurrentEntityModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/invite.channel.html',
        controller  :   'inviteModalCtrl',
        size        :   'lg',
        windowClass :   'allowOverflowY'
      });
    }
    function openInviteToJoinedEntityModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/invite.direct.html',
        controller  :   'inviteUsertoChannelCtrl',
        size        :   'lg'
      });
    }
    function openMemberProfileModal($scope, member) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/profile.view.html',
        controller  :   'profileViewerCtrl',
        windowClass :   'profile-view-modal',
        resolve     :   {
          curUser     : function getCurUser(){ return member; }
        }
      });
    }
    function openPasswordResetRequestModal($scope) {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/password.reset.request.html',
        controller  :   'passwordRequestController',
        size        :   'lg'
      });
    }
    function openFileUploadModal($scope) {
      $modal.open({
        scope       : $scope,
        templateUrl : 'app/modal/upload.html',
        controller  : 'fileUploadModalCtrl',
        size        : 'lg'
      });
    }
    function openTeamMemberListModal($scope) {
      $modal.open({
        sopce       : $scope,
        templateUrl : 'app/modal/team_member_list/team.member.list.html',
        controller  : 'teamMemberListCtrl',
        size        : 'lg'
      });
    }
    function openTeamChangeModal($scope) {
      $modal.open({
        scope       : $scope,
        templateUrl : 'app/modal/team_change/team.change.html',
        controller  : 'teamChangeController',
        size        : 'lg'
      });
    }
    function openTeamSettingModal($scope) {
      $modal.open({
        sopce       : $scope,
        templateUrl : 'app/modal/settings.team.html',
        controller  : 'teamSettingController',
        size        : 'lg'
      });

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
  }
})();