/**
 * @fileoverview DM 일 경우 노출할 Entity header
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('entityHeaderDm', entityHeaderDm);

  function entityHeaderDm(teamAPIservice, publicService) {
    return {
      restrict: 'EA',
      templateUrl: 'app/center/view_components/entity_header/views/entity.header.dm.html',
      link: link
    };

    function link(scope, el, attr)  {
      /**
       * timer
       */
      var _timer;

      /**
       * inactive guide 로부터 mouseout 으로 간주할 시간 값
       * @type {number}
       */
      var DELAY = 200;

      scope.sendInvitation = sendInvitation;
      scope.cancelInvitation = cancelInvitation;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        //dom 이 랜더링 된 후 event 바인딩을 위해 setTimeout 을 사용한다
        setTimeout(_attachDomEvents);
      }

      /**
       * dom 이벤트를 바인딩 한다
       * @private
       */
      function _attachDomEvents() {
        var jqInactiveGuideContainer = el.find('._guideContainer');
        jqInactiveGuideContainer.on('mouseover', _showInactiveGuide)
          .on('mouseout', _hideInactiveGuide);
      }

      /**
       * inactive guide 를 노출한다.
       * @private
       */
      function _showInactiveGuide() {
        clearTimeout(_timer);
        el.find('._guidePopover').fadeIn(200);
      }

      /**
       * inactive guide 를 감춘다.
       * @private
       */
      function _hideInactiveGuide() {
        clearTimeout(_timer);
        _timer = setTimeout(function() {
          el.find('._guidePopover').fadeOut(200);
        }, DELAY);
      }

      /**
       * 초대 메일을 발송한다.
       */
      function sendInvitation() {
        teamAPIservice.inviteToTeam([scope.currentEntity.u_email])
          .then(teamAPIservice.alertInvitationSuccess, null);
      }

      /**
       * 초대를 취소한다.
       */
      function cancelInvitation() {
        teamAPIservice.confirmCancelInvitation(scope.currentEntity.id, {
          onSuccess: publicService.goToDefaultTopic
        })
      }
    }
  }
})();
