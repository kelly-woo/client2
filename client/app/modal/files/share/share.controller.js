(function(){
  'use strict';

  // FILE SHARE controller
  angular
    .module('jandiApp')
    .controller('FileShareModalCtrl', FileShareModalCtrl);

  /* @ngInject */
  function FileShareModalCtrl($scope, $filter, $state, fileAPIservice, $timeout,
                              analyticsService, jndPubSub, fileToShare, modalHelper) {

    $scope.file = fileToShare;
    $scope.shareChannel = $scope.currentEntity;

    //  removing already shared channels and privategroups but allowing users entitiy to be shared more than once.
    //    var shareOptionsChannels = fileAPIservice.removeSharedEntities($scope.file, $scope.joinedChannelList)
    //    var shareOptionsPrivates = fileAPIservice.removeSharedEntities($scope.file, $scope.privateGroupList)
    //    $scope.selectOptions    = fileAPIservice.getShareOptions(shareOptionsChannels, $scope.userList, shareOptionsPrivates);

    var selectOptions = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);
    $scope.selectOptions = fileAPIservice.removeSharedEntities($scope.file, selectOptions);

    // If current channel is one of sharedEntities of 'file',
    // then select first entity in list.
    if ($scope.selectOptions.indexOf($scope.shareChannel) == -1 ) {
      $scope.shareChannel = $scope.selectOptions[0];
    }

    $scope.cancel = modalHelper.closeModal;

    $scope.onFileShareClick = function(shareChannel, comment) {
      $scope.isLoading = true;
      fileAPIservice.addShareEntity($scope.file.id, shareChannel.id)
        .success(function() {
          var channelType;
          var channelId;

          $scope.isLoading = false;

          if (confirm($filter('translate')('@common-file-share-jump-channel-confirm-msg'))) {
            channelType = $scope.shareChannel.type;
            channelId = $scope.shareChannel.id;

            if (channelType === "users") {
              jndPubSub.updateLeftChatList();
              //$rootScope.$broadcast('updateMessageList');
            }

            $state.go('archives', {entityType: channelType, entityId: channelId});
          } else {
            //modalHelper.closeModal();
          }

          // analytics
          var share_target = "";
          switch (shareChannel.type) {
            case 'channel':
              share_target = "topic";
              break;
            case 'privateGroup':
              share_target = "private group";
              break;
            case 'user':
              share_target = "direct message";
              break;
            default:
              share_target = "invalid";
              break;
          }
          var file_meta = ($scope.file.content.type).split("/");
          var share_data = {
            "entity type"   : share_target,
            "category"      : file_meta[0],
            "extension"     : $scope.file.content.ext,
            "mime type"     : $scope.file.content.type,
            "size"          : $scope.file.content.size
          };
          analyticsService.mixpanelTrack( "File Share", share_data );
        })
        .error(function(error) {
          $scope.isLoading = false;

          console.log('onFileShareClick', error.code, error.msg);
        })
        .finally(function() {
        });
    };

    $scope.$on('$destroy', function() {
      console.log('destroyed')
      modalHelper.closeModal();
    });
  }

}());
