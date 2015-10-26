/**
 * @fileoverview external share view 디렉티브
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('externalShareView', externalShareView);

  function externalShareView($sce, memberService, ExternalShareAPIService, Dialog) {
    return {
      restrict: 'A',
      scope: {
        isExternalShared: '=externalShareView',
      },
      link: link
    };
    
    function link(scope, el, attrs) {
      var externalShareDomain = '';

      // team id
      var teamId = attrs.teamId || memberService.getTeamId();

      // file id
      var fileId = attrs.fileId;
      
      _init();
      
      /**
       * init
       * @private
       */
      function _init() {
        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        scope.$on('externalShared', _onExternalShared);
        scope.$on('unExternalShared', _onUnExternalShared);

        el.on('click', _onClick);
      }

      /**
       * click 이벤트 리스너
       * @param {Event} clickEvent
       * @private
       */
      function _onClick(event) {
        //event.stopPropagation();

        if (scope.isExternalShared) {
          Dialog.confirm({
            title: '이 파일의 외부 공유용 링크를 삭제합니다.',
            body: '링크 삭제 시 이전 링크로는 더 이상 파일에 접근할 수 없게 됩니다.',
            confirmButtonText: '삭제하기',
            cancelButtonText: '닫기',
            onClose: function(type) {
              if (type === 'okay') {
                ExternalShareAPIService.unShare(fileId, teamId)
                  .success(function() {
                    scope.isExternalShared = !scope.isExternalShared;
                  });
              }
            }
          });
        } else {


          ExternalShareAPIService.share(fileId, teamId)
            .success(function(data) {
              var externalShareUri = externalShareDomain + data.content.externalCode;

              Dialog.confirm({
                allowHtml: true,
                title: '링크가 성공적으로 생성되었습니다.',
                body: $sce.trustAsHtml('<div><input class="form-control external-share-uri" value="' + externalShareUri + '" /></div>'),
                confirmButtonText: '새 창에서 링크 열기',
                cancelButtonText: '취소',
                onClose: function(type) {
                  if (type === 'okay') {
                    window.open(externalShareUri, '_blank');
                  } else {
                    ExternalShareAPIService.unShare(fileId, teamId);
                  }
                }
              });

              scope.isExternalShared = !scope.isExternalShared;
            });
        }
      }
      
      /**
       * socket 에서 외부 파일 공유 이벤트 발생시
       * @param {object} event - angular 이벤트
       * @param {object} param
       * @param {number|string} param.teamId - team id
       * @param {number|string} param.fileId - file id
       * @private
       */
      function _onExternalShared(event, param) {
        if (_isMyId(param)) {
          scope.isExternalShared = true;
        }
      }
      
      /**
       * socket 에서 외부 파일 공유해제 이벤트 발생시
       * @param {object} event - angular 이벤트
       * @param {object} param
       * @param {number|string} param.teamId - team id
       * @param {number|string} param.fileId - fileId id
       * @private
       */
      function _onUnExternalShared(event, param) {
        if (_isMyId(param)) {
          scope.isExternalShared = false;
        }
      }
      
      /**
       * 현재 directive 에 해당하는 id 인지 여부를 반환한다.
       * @param {object} param
       * @param {number|string} param.teamId - team id
       * @param {number|string} param.fileId - file id
       * @returns {boolean}
       * @private
       */
      function _isMyId(param) {
        return (parseInt(fileId, 10) === parseInt(param.messageId, 10) && parseInt(teamId, 10) === parseInt(param.teamId, 10));
      }
    }
  }
})();
