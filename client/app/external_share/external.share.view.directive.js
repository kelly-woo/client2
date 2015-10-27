/**
 * @fileoverview external share view 디렉티브
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('externalShareView', externalShareView);

  function externalShareView($sce, $filter, memberService, ExternalShareAPIService, Dialog) {
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

        scope.isExternalShared ? _openExternalUnshareDialog() : _setExternalShare();
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

      /**
       * external share 설정한다.
       * @private
       */
      function _setExternalShare() {
        ExternalShareAPIService.share(fileId, teamId)
          .success(function(data) {
            var content;

            if (content = data.content) {
              _openExternalShareDialog(content);
              scope.isExternalShared = !scope.isExternalShared;
            }
          });
      }

      /**
       * external share dialog를 연다.
       * @param {object} ontent
       * @private
       */
      function _openExternalShareDialog(content) {
        var externalShareUri = externalShareDomain + content.externalCode;
        var confirmTitle = content.name + '의 공유용 링크';
        var confirmBody = '<input class="form-control external-share-uri" value="' + externalShareUri + '" />' +
                          '<br><span>Ctrl+C를 눌러 링크를 복사하세요!</span>';

        Dialog.success({
          title: '공유 링크가 성공적으로 생성되었습니다.'
        });

        Dialog.confirm({
          allowHtml: true,
          title: confirmTitle,
          body: $sce.trustAsHtml(confirmBody),
          confirmButtonText: '새 창에서 링크 열기',
          cancelButtonText: '닫기',
          onClose: function(type) {
            type === 'okay' && window.open(externalShareUri, '_blank');
          }
        });
      }

      /**
       * external unshare dialog를 연다.
       * @private
       */
      function _openExternalUnshareDialog() {
        Dialog.confirm({
          title: '이 파일의 외부 공유용 링크를 삭제합니다.',
          body: '링크 삭제 시 이전 링크로는 더 이상 파일에 접근할 수 없게 됩니다.',
          confirmButtonText: '삭제하기',
          cancelButtonText: '닫기',
          onClose: function(type) {
            type === 'okay' && _setExternalUnshare();
          }
        });
      }

      /**
       * external unshare 설정한다.
       * @private
       */
      function _setExternalUnshare() {
        ExternalShareAPIService.unshare(fileId, teamId)
          .success(function() {
            scope.isExternalShared = !scope.isExternalShared;
          });
      }
    }
  }
})();
