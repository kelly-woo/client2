/**
 * @fileoverview topic desciprtion directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicDescription', jndTooltip);

  /* @ngInject */
  function jndTooltip($document) {
    return {
      restrict: 'EA',
      controller: 'jndTooltipCtrl',
      templateUrl: 'app/center/view_components/entity_header/topic_description/topic.description.html',
      link: link
    };

    function link(scope, el, attrs) {
      var isRightClicked = false;
      var jqDescriptionContainer = $(el);

      jqDescriptionContainer.on('mouseenter', onMouseEnter);
      jqDescriptionContainer.on('mouseleave', onMouseLeave);
      jqDescriptionContainer.on('mousedown', onMouseDown);

      /**
       * mouseevent event handler.
       */
      function onMouseEnter() {
        jqDescriptionContainer.addClass('show-description');
        _attachEventHandler();
      }

      /**
       * mouseleave event handler
       * @param event
       */
      function onMouseLeave(event) {
        if (!isRightClicked) {
          jqDescriptionContainer.removeClass('show-description');
          _detachEventHandler();
        } else {
          isRightClicked = false;
        }
      }

      /**
       * mousedown event handler.
       * chrome에서 우클릭할 경우 mouseleave 가 trigger 되는 현상이 있음.
       * 우클릭시에에는 mouseleave가 trigger되도 팝업을 닫지 않기 위함.
       * @param event
       */
      function onMouseDown(event) {
        if (event.which === 3) {
          isRightClicked = true;
        } else {
          isRightClicked = false;
        }
      }

      /**
       * $document 전체의 click을 듣는다.
       * @private
       */
      function _attachEventHandler() {
        $document.on('click', onDocumentClick);
      }

      /**
       * $document 전체의 click를 듣는 리스너를 파기한다.
        * @private
       */
      function _detachEventHandler() {
        $document.off('click', onDocumentClick);
      }

      /**
       * description내에서 클릭이 일어났을 경우 무시한다. 하지만 그외 공간에서 클릭에 대해서는 현재 팝업을 닫는다.
       * @param event
       */
      function onDocumentClick(event) {
        if (!event.target.closest('.panel-title-topic-description')) {
          jqDescriptionContainer.removeClass('show-description');
        }
      }
    }

  }

})();
