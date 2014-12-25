(function() {
    angular
        .module('jandiApp')
        .factory('publicService', publicService);

    publicService.$inject = ['$modal', 'accountService', 'storageAPIservice', 'memberService'];

    function publicService($modal, accountService, storageAPIservice, memberService) {
        var service = {
            openPrivacyModal: openPrivacyModal,
            openAgreementModal: openAgreementModal,
            openJoinModal: openJoinModal,
            openTopicCreateModal: openTopicCreateModal,
            openPrivateCreateModal: openPrivateCreateModal,
            openInviteToTeamModal: openInviteToTeamModal,
            openTutorialModal: openTutorialModal,
            openCurrentMemberModal: openCurrentMemberModal,
            openInviteToCurrentEntityModal: openInviteToCurrentEntityModal,
            closeModal: closeModal,
            signOut: signOut
        };

        return service;

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
        function closeModal(modalInstance) {
            modalInstance.dismiss('close');
        }

        function signOut() {
            storageAPIservice.removeSession();
            storageAPIservice.removeLocal();
            accountService.removeAccount();
            memberService.removeMember();

            if(mixpanel.cookie) mixpanel.cookie.clear();
            $state.go('signin');

        }
    }
})();