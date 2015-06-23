(function(){
  'use strict';

  // FILE SHARE controller
  angular
    .module('jandiApp')
    .controller('FileShareModalCtrl', FileShareModalCtrl);

  /* @ngInject */
  function FileShareModalCtrl($scope, $filter, $state, fileAPIservice, $timeout,
                              analyticsService, jndPubSub, fileToShare, modalHelper, analyticsHelper) {

    var _entityType;
    var _entityId;
    var callback;

    $scope.file = fileToShare;

    var selectOptions = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);
    $scope.selectOptions = fileAPIservice.removeSharedEntities($scope.file, selectOptions);

    $scope.shareChannel = $scope.currentEntity;

    $scope.cancel = modalHelper.closeModal;

    $scope.onFileShareClick = onFileShareClick;

    $scope.$on('$destroy', _onScopeDestroy);

    _init();

    function _init() {
      // If current channel is one of sharedEntities of 'file',
      // then select first entity in list.
      if ($scope.selectOptions.indexOf($scope.shareChannel) === -1 ) {
        $scope.shareChannel = $scope.selectOptions[0];
      }
    }


    /**
     * 파일을 다른 곳으로 쉐어한다.
     * @param {object} shareChannel - share 할 entity
     */
    function onFileShareClick(shareChannel) {
      _entityId = shareChannel.id;
      _entityType = shareChannel.type;

      $scope.isLoading = true;
      fileAPIservice.addShareEntity($scope.file.id, shareChannel.id)
        .success(function() {
          
          var property = {};
          var PROPERTY_CONSTANT = analyticsHelper.PROPERTY;

          property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = true;
          property[PROPERTY_CONSTANT.TOPIC_ID] = shareChannel.id;
          property[PROPERTY_CONSTANT.FILE_ID] = $scope.file.id;
          analyticsHelper.track(analyticsHelper.EVENT.FILE_SHARE, property);

          _onShareSuccess()
        })
        .error(function(error) {
          $scope.isLoading = false;
          var property = {};
          var PROPERTY_CONSTANT = analyticsHelper.PROPERTY;

          //analytics
          property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = false;
          property[PROPERTY_CONSTANT.ERROR_CODE] = error.code;
          analyticsHelper.track(analyticsHelper.EVENT.FILE_SHARE, property);

          console.log('onFileShareClick', error.code, error.msg);
        });
    }

    /**
     * file share 가 성공적이었을 경우
     * @private
     */
    function _onShareSuccess() {
      $scope.isLoading = false;
      

      _sendAnalytics(_entityType);

      if (confirm($filter('translate')('@common-file-share-jump-channel-confirm-msg'))) {
        if (_entityType === "users") {
          jndPubSub.updateLeftChatList();
          //$rootScope.$broadcast('updateMessageList');
        }
        modalHelper.closeModal();

        callback = _goToSharedEntity;
      }
    }

    /**
     * mixpanel 에 analytics 정보를 보낸다.
     * @private
     */
    function _sendAnalytics() {
      // TODO: 곧 없어질 아이
      // analytics
      var share_target = "";
      switch (_entityType) {
        case 'channels':
          share_target = "topic";
          break;
        case 'privategroups':
          share_target = "private group";
          break;
        case 'users':
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
    }

    /**
     * share 된 엔티티로 state 를 옮긴다.
     * @private
     */
    function _goToSharedEntity() {
      $state.go('archives', {entityType: _entityType, entityId: _entityId});
    }

    /**
     * 현재 scope 가 없어질 때 호출된다.
      * @private
     */
    function _onScopeDestroy() {
      if (!!callback) {
        callback();
      }
    }
  }

}());
