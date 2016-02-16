/**
 * @fileoverview topic desciprtion directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicDescription', topicDescription);

  /* @ngInject */
  function topicDescription($document) {
    return {
      restrict: 'EA',
      controller: 'TopicDescriptionCtrl',
      templateUrl: 'app/center/view_components/entity_header/topic_description/topic.description.html',
      link: link
    };

    function link(scope, el, attrs) {
      var isRightClicked = false;
      var jqDescriptionContainer = $(el);

      scope.$on('$destroy', _detachBasicEventHandler);

      _attachBasicEventHandler();

      /**
       * 디스크립션아이콘이 기본적으로 듣고 있어야 할 이벤트들의 모음이다.
       * @private
       */
      function _attachBasicEventHandler() {
        jqDescriptionContainer.on('mouseenter', _onMouseEnter);
        jqDescriptionContainer.on('mouseleave', _onMouseLeave);
        jqDescriptionContainer.on('mousedown', _onMouseDown);

      }

      /**
       * 기본적으로 가지고있어야 할 이벤트들을 다시 분리시킨다.
       * topic.description.controller에서 $scope 가 $destroy이 될때 호출된다.
       */
      function _detachBasicEventHandler() {
        jqDescriptionContainer.off('mouseenter', _onMouseEnter);
        jqDescriptionContainer.off('mouseleave', _onMouseLeave);
        jqDescriptionContainer.off('mousedown', _onMouseDown);
      }

      /**
       * mouseevent event handler.
       */
      function _onMouseEnter() {
        jqDescriptionContainer.addClass('show-description');
        _attachEventHandler();
      }

      /**
       * mouseleave event handler
       * @param event
       */
      function _onMouseLeave(event) {
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
      function _onMouseDown(event) {
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
        //TODO : IS THIS BEST WAY? -JIHOON
        if (!event.target.closest('.panel-title-topic-description')) {
          jqDescriptionContainer.removeClass('show-description');
        }
      }
    }
  }

})();
