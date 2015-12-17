/**
 * @fileoverview external share view 디렉티브
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('externalShareView', externalShareView);

  function externalShareView($filter, memberService, ExternalShareService, Dialog, JndUtil) {
    return {
      restrict: 'A',
      scope: {
        externalUrl: '=?',
        externalCode: '=?',
        externalShared: '=?',
        getExternalShare: '&externalShareGet',
        setExternalShare: '&externalShareSet'
      },
      link: link
    };
    
    function link(scope, el, attrs) {
      // team id
      var teamId = attrs.teamId || memberService.getTeamId();

      
      _init();
      
      /**
       * init
       * @private
       */
      function _init() {
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$on('externalShared', _onExternalShared);
        scope.$on('unExternalShared', _onUnExternalShared);
      }

      function _attachDomEvents() {
        el.on('click', _onClick);
      }

      /**
       * click 이벤트 리스너
       * @param {Event} event
       * @private
       */
      function _onClick(event) {
        //event.stopPropagation();


        if (scope.getExternalShare()) {
          JndUtil.safeApply(scope, function() {
            ExternalShareService.openUnshareDialog(function(type) {
              type === 'okay' && _setExternalUnshare();
            });
          });
        } else {
          _setExternalShare();
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
          scope.setExternalShare({
            $value: true
          });
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
          scope.setExternalShare({
            $value: false
          });
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
        var fileId = scope.$eval(attrs.fileId);
        return (parseInt(fileId, 10) === parseInt(param.messageId, 10) && parseInt(teamId, 10) === parseInt(param.teamId, 10));
      }

      /**
       * external share 설정한다.
       * @private
       */
      function _setExternalShare() {
        var fileId = scope.$eval(attrs.fileId);

        ExternalShareService.share(fileId, teamId)
          .success(_onExternalShareSuccess);
      }

      /**
       * exteral share success
       * @param {object} data
       * @private
       */
      function _onExternalShareSuccess(data) {
        var content;

        if (content = data.content) {
          _setExternalContent(content);
  
          ExternalShareService.openShareDialog(content, true);
        }
      }

      /**
       * external unshare 설정한다.
       * @private
       */
      function _setExternalUnshare() {
        var fileId = scope.$eval(attrs.fileId);

        ExternalShareService.unshare(fileId, teamId)
          .success(_onExternalUnshareSuccess);
      }

      /**
       * external unshare success
       * @param {object} data
       * @private
       */
      function _onExternalUnshareSuccess(data) {
        var content;

        if (content = data.content) {
          Dialog.success({
            title: $filter('translate')('@external-share-remove-msg')
          });
  
          _setExternalContent(content);
        }
      }
  
      /**
       * external content를 설정한다.
       * @param {object} content
       * @private
       */
      function _setExternalContent(content) {
        scope.externalUrl = content.externalUrl;
        scope.externalCode = content.externalCode;
        scope.externalShared = content.externalShared;
    
        scope.setExternalShare({
          $value: scope.externalShared
        });
      }
    }
  }
})();
