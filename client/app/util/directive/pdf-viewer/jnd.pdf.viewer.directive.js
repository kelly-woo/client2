/**
 * @fileoverview PDF viewer 를 wrapping 한 directive. tooltip 과 titlebar 를 담당한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndPdfViewer', jndPdfViewer);

  function jndPdfViewer($rootScope, $state, UserList, fileAPIservice, PdfViewer, jndKeyCode, JndUtil) {
    return {
      restrict: 'E',
      scope: {},
      replace: true,
      templateUrl: 'app/util/directive/pdf-viewer/jnd.pdf.viewer.html',
      link: link
    };

    function link(scope, el, attrs) {
      /**
       * toolbar 를 노출하는 시간 값
       * @type {number}
       */
      var TOOLBAR_ACTIVE_DURATION = 500;
      var _timer;
      var _isLoaded = false;

      scope.currentPage = 1;
      scope.totalPage = 1;

      scope.close = PdfViewer.unload;
      scope.zoomOut = PdfViewer.zoomOut;
      scope.zoomIn = PdfViewer.zoomIn;
      scope.zoomDefault = PdfViewer.zoomDefault;
      
      scope.prevPage = PdfViewer.prevPage;
      scope.nextPage = PdfViewer.nextPage;
      scope.openFileDetail = openFileDetail;
      
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _attachScopeEvents();
        _hide();
      }

      /**
       * scope 이벤트를 바인딩 한다.
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('JndPdfViewer:load', _onLoad);
        scope.$on('PdfViewer:unload:success', _onUnload);
        scope.$on('PdfViewer:load:success', _onSuccessLoad);
        scope.$on('PdfViewer:load:error', _onErrorLoad);
        scope.$on('PdfViewer:pageChange', _onPageChange);
      }

      /**
       * dom 이벤트를 바인딩 한다.
       * @private
       */
      function _attachDomEvents() {
        $('body').on('keydown', _onKeyDown)
          .on('mousewheel mousemove click', _showToolbar);
        el.find('._error').on('click', PdfViewer.unload);
      }

      /**
       * dom 이벤트 바인딩을 해제 한다.
       * @private
       */
      function _detachDomEvents() {
        $('body').off('keydown', _onKeyDown)
          .off('mousewheel mousemove click', _showToolbar);
        el.find('._error').off('click', PdfViewer.unload);
      }

      /**
       * toolbar 를 노출한다.
       * @private
       */
      function _showToolbar() {
        if (_isLoaded) {
          el.find('._toolbar').addClass('fade in');
          clearTimeout(_timer);
          _timer = setTimeout(_hideToolbar, TOOLBAR_ACTIVE_DURATION);
        }
      }

      /**
       * toolbar 를 감춘다.
       * @private
       */
      function _hideToolbar() {
        if (_isLoaded) {
          el.find('._toolbar').removeClass('in').addClass('out');
        }
      }

      /**
       * file detail 을 노출한다.
       * @param {boolean} isCommentFocus - true 일 경우 comment 에 focus 가 있는 상태로 file detail 을 노출한다.
       */
      function openFileDetail(isCommentFocus) {
        var file = scope.file;
        var writer;
        if ($state.params.itemId != file.id) {
          if (isCommentFocus) {
            $rootScope.setFileDetailCommentFocus = true;
          }
          writer = UserList.get(file.writerId);
          $state.go('files', {
            userName    : writer.name,
            itemId      : file.id
          });
        } else if (isCommentFocus) {
          fileAPIservice.broadcastCommentFocus();
        }
        PdfViewer.unload();
      }

      /**
       * keydown 이벤트 핸들러
       * @param {object} keyEvent
       * @private
       */
      function _onKeyDown(keyEvent) {
        var isActionExists = true;

        if (jndKeyCode.match('ESC', keyEvent.keyCode)) {
          PdfViewer.unload();
        } else if (jndKeyCode.match('PLUS', keyEvent.keyCode) || jndKeyCode.match('NUM_PAD_PLUS', keyEvent.keyCode)) {
          PdfViewer.zoomIn();
        } else if (jndKeyCode.match('MINUS', keyEvent.keyCode) || jndKeyCode.match('NUM_PAD_MINUS', keyEvent.keyCode)) {
          PdfViewer.zoomOut();
        } else if (jndKeyCode.match('PAGE_UP', keyEvent.keyCode)) {
          PdfViewer.prevPage();
        } else if (jndKeyCode.match('PAGE_DOWN', keyEvent.keyCode)) {
          PdfViewer.nextPage();
        } else {
          isActionExists = false;
        }
        if (isActionExists) {
          keyEvent.preventDefault();
        }
        
        //jnd.main.key.handler 에서 키 이벤트를 처리하지 않도록 stopPropagation 을 호출한다.
        keyEvent.stopPropagation();
      }

      /**
       * page 변경시 콜백
       * @param {object} angularEvent
       * @param {number} currentPage
       * @param {number} totalPage
       * @private
       */
      function _onPageChange(angularEvent, currentPage, totalPage) {
        scope.currentPage = currentPage;
        scope.totalPage = totalPage;
      }

      /**
       * load 시작 콜백
       * @param {object} angularEvent
       * @param {string} url - load 할 파일 url
       * @param {object} file - title bar 에 노출할 정보를 담고 있는 파일 object 
       * @private
       */
      function _onLoad(angularEvent, url, file) {
        _isLoaded = false;
        _showLoading();
        _hideError();
        JndUtil.safeApply(scope, function() {
          scope.file = file;
        });
        _show();
      }
      
      /**
       * pdf 가 성공적으로 load 되었을 때 콜백
       * @private
       */
      function _onSuccessLoad() {
        _isLoaded = true;
        _hideLoading();
      }

      /**
       * pdf 로딩 실패시 콜백
       * @private
       */
      function _onErrorLoad() {
        _isLoaded = false;
        _hideLoading();
        _showError();
      }

      /**
       * error layer 를 노출한다.
       * @private
       */
      function _showError() {
        el.find('._error').show();
      }

      /**
       * error layer 를 감춘다.
       * @private
       */
      function _hideError() {
        el.find('._error').hide();
      }

      /**
       * loading view 를 노출한다.
       * @private
       */
      function _showLoading() {
        el.find('._loading').show();
        el.find('._toolbar').hide();
      }

      /**
       * loading view 를 감춘다.
       * @private
       */
      function _hideLoading() {
        el.find('._loading').hide();
        el.find('._toolbar').show();
      }

      /**
       * viewer 를 감춘다.
       * @private
       */
      function _hide() {
        _detachDomEvents();
        el.hide();
      }

      /**
       * viewer 를 노출한다.
       * @private
       */
      function _show() {
        _attachDomEvents();
        el.show();
      }

      /**
       * pdf 가 unload 되었을 때 콜백
       * @private
       */
      function _onUnload() {
        _hide();
      }
    }
  }
})();
