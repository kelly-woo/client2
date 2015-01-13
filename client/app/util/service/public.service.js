(function() {
    angular
        .module('jandiApp')
        .factory('publicService', publicService);

    publicService.$inject = ['$rootScope', '$modal', 'accountService', 'storageAPIservice', 'memberService', 'gettextCatalog', '$state'];

    function publicService($rootScope, $modal, accountService, storageAPIservice, memberService, gettextCatalog, $state) {
        var service = {
            getInviteOptions: getInviteOptions,
            openPrivacyModal: openPrivacyModal,
            openAgreementModal: openAgreementModal,
            openJoinModal: openJoinModal,
            openTopicCreateModal: openTopicCreateModal,
            openPrivateCreateModal: openPrivateCreateModal,
            openInviteToTeamModal: openInviteToTeamModal,
            openTutorialModal: openTutorialModal,
            openCurrentMemberModal: openCurrentMemberModal,
            openInviteToCurrentEntityModal: openInviteToCurrentEntityModal,
            openInviteToJoinedEntityModal: openInviteToJoinedEntityModal,
            openMemberProfileModal: openMemberProfileModal,
            openPasswordResetRequestModal: openPasswordResetRequestModal,
            openFileUploadModal: openFileUploadModal,
            openTeamChangeModal: openTeamChangeModal,
            openTeamSettingModal: openTeamSettingModal,
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
                templateUrl :   'app/modal/create.channel.html',
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
        function openTutorialModal($scope, tutorialId) {
            var modal;

            switch (tutorialId) {
                case 'welcomeTutorial':
                    modal = $modal.open({
                        templateUrl: 'app/tutorial/tutorial.html',
                        controller: 'tutorialController',
                        windowClass: 'fade-only welcome-tutorial',
                        backdropClass: 'welcome-tutorial-backdrop',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            curState: function getCurrentTutorial() {
                                return 0;
                            }
                        }
                    });
                    break;
                case 'topicTutorial':
                    modal = $modal.open({
                        scope: $scope,
                        templateUrl: 'app/tutorial/tutorial.html',
                        controller: 'tutorialController',
                        windowClass: 'fade-only welcome-tutorial topic-tutorial tutorial-animation',
                        backdrop: false,
                        keyboard: false,
                        resolve: {
                            curState: function getCurrentTutorial() {
                                return 1;
                            }
                        }
                    });
                    break;
                case 'chatTutorial' :
                    modal = $modal.open({
                        scope: $scope,
                        templateUrl: 'app/tutorial/tutorial.html',
                        controller: 'tutorialController',
                        windowClass: 'fade-only welcome-tutorial chat-tutorial',
                        backdrop: false,
                        keyboard: false,
                        resolve: {
                            curState: function getCurrentTutorial() {
                                return 2;
                            }
                        }
                    });
                    break;
                case 'fileTutorial' :
                    modal = $modal.open({
                        scope: $scope,
                        templateUrl: 'app/tutorial/tutorial.html',
                        controller: 'tutorialController',
                        windowClass: 'fade-only welcome-tutorial file-tutorial',
                        backdrop: false,
                        keyboard: false,
                        resolve: {
                            curState: function getCurrentTutorial() {
                                return 3;
                            }
                        }
                    });
                    break;
                default :
                    break;
            }

            return modal;
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
            var userLang;
            var serverLang;

            if (angular.isUndefined(curLang))
                curLang = accountService.getAccountLanguage();

            curLang = curLang.toLowerCase();

            // Choose correct/right format!!
            if (curLang.indexOf('ko') >= 0) {
                // korean
                userLang    = 'ko';
                serverLang  = 'ko';
            }
            else if (curLang.indexOf('en') >= 0) {
                // english
                userLang    = 'en_US';
                serverLang  = 'en';

            }
            else if (curLang.indexOf('zh') >= 0) {
                // chinese
                if (curLang.indexOf('tw') >= 0) {
                    // main land china
                    userLang    = 'zh_TW';
                    serverLang  = 'zh-tw';
                }
                else {
                    userLang    = 'zh_CN';
                    serverLang  = 'zh-cn';
                }
            }
            else if (curLang.indexOf('ja') >= 0) {
                // japanese
                userLang    = 'ja';
                serverLang  = 'ja';
            }
            else {
                // default
                userLang    = 'en_US';
                serverLang  = 'en';
            }

            // Save it!!
            $rootScope.preferences.language     = userLang;
            $rootScope.preferences.serverLang   = serverLang;
        }

        // Setting language for translator, nggettext
        function setCurrentLanguage() {
            gettextCatalog.setCurrentLanguage($rootScope.preferences.language);
            storageAPIservice.setLastLang($rootScope.preferences.language);
        }
        // Setting debug mode for translator, nggettext
        function setDebugMode(isDebug) {
            gettextCatalog.debug = isDebug;

        }
        function signOut() {
            // There is no need to remove session storage, but still just in case.
            storageAPIservice.removeSession();
            storageAPIservice.removeLocal();
            storageAPIservice.removeCookie();

            accountService.removeAccount();
            memberService.removeMember();


            if(mixpanel.cookie) mixpanel.cookie.clear();
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