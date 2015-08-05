/**
 * @fileoverview 센터페널 메세지중 단순 텍스트일때만 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('CenterFileDropdownLayerCtrl', CenterFileDropdownLayerCtrl);

  /* @ngInject */
  function CenterFileDropdownLayerCtrl($scope, $rootScope, $filter, fileAPIservice, AnalyticsHelper) {
    // 현재 로그인되어있는 멤버(나)의 아이디
    var _myId;
    // 현재 토픽의 타입
    var _entityType;
    // 현재 토픽의 아이디
    var _entityId;

    $scope.msg = {
      message: {
        id: 0
      }
    };
    $scope.isShown = false;
    $scope.isIntegrateFile = false;
    $scope.onFileDeleteClick = onFileDeleteClick;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
    }

    function onFileDeleteClick() {
      var fileId = $scope.msg.message.id;

      if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
        return;
      }

      fileAPIservice.deleteFile(fileId)
        .success(function(response) {
          try {
            //analytics
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
              'RESPONSE_SUCCESS': true,
              'FILE_ID': fileId
            });
          } catch (e) {
          }

          $rootScope.$broadcast('onFileDeleted', fileId);
        })
        .error(function(err) {
          console.log(err);
          try {
            //analytics
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': err.code
            });
          } catch (e) {
          }
        })
        .finally(function() {

        });
    }
  }
})();
