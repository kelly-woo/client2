/**
 * @fileoverview DM 일 경우 노출할 Entity header
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('entityHeaderDm', entityHeaderDm);

  function entityHeaderDm() {
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
    }
  }
})();
