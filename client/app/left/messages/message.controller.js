(function() {
    'use strict';

    angular
        .module('jandiApp')
        .controller('messageListCtrl', messageListCtrl);

    /* @ngInject */
    function messageListCtrl($scope, $rootScope, storageAPIservice, messageList, entityAPIservice) {
        var vm = this;


        // okay - okay to go!
        // loading - currently loading.
        // failed - failed to retrieve list from server.

        vm.messageListLoadingStatus = 'okay';

        vm.messageList;
        vm.isMessageListCollapsed = storageAPIservice.isLeftDMCollapsed();

        // TODO: REALLY??? IS THIS THE BEST???
        vm.onDMInputFocus = onDMInputFocus;
        vm.onDMInputBlur = onDMInputBlur;

        vm.onMessageHeaderClick = onMessageHeaderClick;
        vm.onMeesageLeaveClick = onMeesageLeaveClick;

        // Must keep watching memberList in 'leftController' in order to keep member's starred status.
        $scope.$watch('memberList', function() {
            getMessageList();
        });

        $scope.$on('updateMessageList', function() {
            getMessageList();
        });

        getMessageList();

        function getMessageList() {
            if (vm.messageListLoadingStatus == 'loading') return;

            vm.messageListLoadingStatus = 'loading';

            messageList.getRecentMessageList()
                .success(function(response) {
                    vm.messageList = _generateMessageList(response);
                    vm.messageListLoadingStatus = 'okay';
                })
                .error(function(err) {
                    vm.messageListLoadingStatus = 'failed';
                    console.log(err)
                })
                .finally(function() {
                });
        }

        function onMessageHeaderClick() {
            vm.isMessageListCollapsed = !vm.isMessageListCollapsed;
            storageAPIservice.setLeftDMCollapsed(vm.isMessageListCollapsed);
        }

        function _generateMessageList(messages) {
            var messageList = [];

            _.each(messages, function(message) {

                var entity = entityAPIservice.getEntityFromListById($scope.memberList, message.entityId);

                if (!angular.isUndefined(entity)) {
                    if (message.unread > 0) {
                        entityAPIservice.updateBadgeValue(entity, message.unread);
                    }
                    messageList.push(entity);
                }
            });

            return messageList;
        }

        function onMeesageLeaveClick(entityId) {
            messageList.leaveCurrentMessage(entityId)
                .success(function(response) {
                    if (entityId == $scope.currentEntity.id) {
                        $rootScope.toDefault = true;
                    }
                })
                .error(function(err) {
                    // TODO: WHAT SHOULD I DO WHEN FAILED?
                })
                .finally(function() {
                    getMessageList();
                });

        }


        function onDMInputFocus() {
            $('.absolute-search-icon').stop().animate({opacity: 1}, 400);
        }

        function onDMInputBlur() {
            $('.absolute-search-icon').stop().css({'opacity' : 0.2});
        }

    }

})();