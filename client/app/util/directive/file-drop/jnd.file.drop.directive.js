/**
 * @fileoverview Jandi File Drop Directive
 * @author Soonyoung Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndFileDrop', jndFileDrop);

  /**
   * file drop 영역 directive
   */
  function jndFileDrop($templateRequest, $rootScope, $compile) {
    /**
     * template 경로
     * @type {string}
     */
    var TEMPLATE_URL = 'app/util/directive/file-drop/jnd.file.drop.html';

    return {
      restrict: 'A',
      controller: 'JndFileDropCtrl',
      link: link
    };

    function link(scope, el, attrs) {
      var DELAY = 100;
      var _timer = null;
      var _jqDragArea;

      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _loadTemplate();
      }

      /**
       * template 를 로드한다.
       * @private
       */
      function _loadTemplate() {
        $templateRequest(TEMPLATE_URL).then(_onSuccessLoadTemplate);
      }

      /**
       * template 로드가 완료 된 이후 콜백
       * @param {string} template
       * @private
       */
      function _onSuccessLoadTemplate(template) {
        _jqDragArea = $compile(template)($rootScope.$new(true));

        el.on('dragover',_show);
        _jqDragArea.appendTo(el[0])
          .on('dragleave',_hide)
          .on('drop', _hide);
      }

      /**
       * 영역을 감춘다.
       * @private
       */
      function _hide() {
        _timer = setTimeout(function() {
          _jqDragArea.hide()
        }, DELAY);
      }

      /**
       * 영역을 노출한다.
       * @private
       */
      function _show() {
        clearTimeout(_timer);
        _jqDragArea.show();
      }
    }
  }
})();
