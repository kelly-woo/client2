/**
 * @fileoverview external share service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ExternalShareService', ExternalShareService);

  /* @ngInject */
  function ExternalShareService($http, $sce, memberService, configuration, Dialog) {
    var that = this;
    var _server_address = configuration.server_address;
    var _teamId = memberService.getTeamId();

    var externalShareDomain = '';

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      that.share = share;
      that.openShareDialog = openShareDialog;

      that.unshare = unshare;
      that.openUnshareDialog = openUnshareDialog;
    }

    /**
     * 외부 파일 공유 설정한다.
     * @param {number|string} fileId
     * @param {number|string} [teamId=현재팀]
     * @returns {*}
     */
    function share(fileId, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method: 'PUT',
        url: _server_address + 'teams/' + teamId + '/files/' + fileId + '/externalShared'
      });
    }

    /**
     * 외부 파일 공유 해제한다.
     * @param {number|string} fileId
     * @param {number|string} [teamId=현재팀]
     * @returns {*}
     */
    function unshare(fileId, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method: 'DELETE',
        url: _server_address + 'teams/' + teamId + '/files/' + fileId + '/externalShared'
      });
    }

    /**
     * external share dialog를 연다.
     * @param {object} content
     * @param {boolean} [isCreateLink=false] - 공유 링크 생성여부
     * @private
     */
    function openShareDialog(content, isCreateLink) {
      var externalShareUri = externalShareDomain + content.externalCode;
      var confirmTitle = '<span><i class="icon-link"></i></span>' + content.name + '의 공유용 링크';
      var confirmBody = '<input class="form-control external-share-uri" value="' + externalShareUri + '" />' +
        '<span>Ctrl+C를 눌러 링크를 복사하세요!</span>';

      if (isCreateLink) {
        Dialog.success({
          title: '공유 링크가 성공적으로 생성되었습니다.'
        });
      }

      Dialog.confirm({
        allowHtml: true,
        title: confirmTitle,
        titleClass: 'external-share-title',
        body: $sce.trustAsHtml(confirmBody),
        bodyClass: 'normal-body external-share-body',
        confirmButtonText: '새 창에서 링크 열기',
        cancelButtonText: '닫기',
        onDialogLoad: function(el) {
          el.find('.external-share-uri').focus().select();
        },
        onClose: function(type) {
          type === 'okay' && window.open(externalShareUri, '_blank');
        }
      });
    }

    /**
     * external unshare dialog를 연다.
     * @param {function} onClose
     */
    function openUnshareDialog(onClose) {
      Dialog.confirm({
        title: '이 파일의 외부 공유용 링크를 삭제합니다.',
        titleClass: 'external-unshare-title',
        body: '링크 삭제 시 이전 링크로는 더 이상 파일에 접근할 수 없게 됩니다.',
        confirmButtonText: '삭제하기',
        cancelButtonText: '닫기',
        onClose: onClose
      });
    }
  }
})();
