(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('leftFolderDropdown', leftFolderDropdown);

  function leftFolderDropdown(jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attr, ctrl) {
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * 이벤트 리스너를 바인딩한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }


      /**
       * dom 이벤트를 attach 한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onClick);
      }

      /**
       * dom 이벤트를 detach 한다.
       * @private
       */
      function _detachDomEvents() {
        el.off('click', _onClick);
      }

      function _onClick(clickEvent) {
        clickEvent.stopPropagation();
        jndPubSub.pub('show:left-folder-dropdown', {
          target: el,
          folder: scope.folder
        });
      }
    }
  }
})();