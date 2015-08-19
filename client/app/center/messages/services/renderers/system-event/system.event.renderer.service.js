/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('SystemEventRenderer', SystemEventRenderer);

  /* @ngInject */
  function SystemEventRenderer($templateRequest, $filter, MessageCollection, language) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/system-event/system.event.html';
    var _template = '';

    this.render = render;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }
    function _getEventTypeStatus(msg) {
      var status = {};
      switch (msg.info.eventType) {
        case 'invite':
          status.isInvite = true;
          break;
        case 'announcement_deleted':
          status.isAnnouncementDeleted = true;
          break;
        case 'announcement_created':
          status.isAnnouncementCreated = true;
          break;
      }
      return status;
    }

    function _getPreTranslate(key, mapper) {
      return $filter('template')($filter('translate')(key), mapper);
    }

    function render(index) {

      var msg = MessageCollection.list[index];
      var filter = $filter('getName');
      var length = (msg && msg.message && msg.message.invites && msg.message.invites.length) || 0;
      var invitees = [];
      var lang = language.preferences.language;
      var hasPostfix = !!(lang === 'ko' || lang === 'ja');
      var status = _getEventTypeStatus(msg);

      _.forEach(msg.message.invites, function(invitee, index) {
        invitees.push({
          name: filter(invitee),
          isLast: length - 1 === index
        });
      });

      return _template({
        text: {
          announcement:  {
            deleted: _getPreTranslate('@system-msg-announcement-deleted', {
              msg: msg
            }),
            created: _getPreTranslate('@system-msg-announcement-created', {
              msg: msg
            })
          }
        },
        status: status,
        hasPostfix: hasPostfix,
        msg: msg,
        invitees: invitees
      });
    }
  }
})();
