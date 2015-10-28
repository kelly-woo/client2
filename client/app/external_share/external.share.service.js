/**
 * @fileoverview external share service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ExternalShareService', ExternalShareService);

  /* @ngInject */
  function ExternalShareService($http, $sce, $filter, memberService, configuration, Dialog) {
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
      var translate = $filter('translate');
      var externalShareUri = externalShareDomain + content.externalCode;
      var confirmTitle = '<span><i class="icon-link"></i></span>' + translate('@external-share-create-title').replace('{{fileName}}', content.name);
      var confirmBody = '<input class="form-control external-share-uri" value="' + externalShareUri + '" />' +
        '<span>' + translate('@external-share-create-desc') + '</span>';

      if (isCreateLink) {
        Dialog.success({
          title: translate('@external-share-create-msg')
        });
      }

      Dialog.confirm({
        allowHtml: true,
        title: confirmTitle,
        titleClass: 'external-share-title',
        body: $sce.trustAsHtml(confirmBody),
        bodyClass: 'normal-body external-share-body',
        confirmButtonText: translate('@common-open-new-window'),
        cancelButtonText: translate('@btn-close'),
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
      var translate = $filter('translate');

      Dialog.confirm({
        title: translate('@external-share-remove-title'), //'이 파일의 외부 공유용 링크를 삭제합니다.',
        titleClass: 'external-unshare-title',
        body: translate('@external-share-remove-desc'),
        confirmButtonText: translate('@btn-delete'),
        cancelButtonText: translate('@btn-close'),
        onClose: onClose
      });
    }
  }
})();
