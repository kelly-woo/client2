/**
 * @fileoverview pdf viewer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndPdfViewer', JndPdfViewer);

  /* @ngInject */
  function JndPdfViewer(jndPubSub, PdfViewer) {

    this.load = load;

    _init();

    /**
     * 초기
     * @private
     */
    function _init() {
    }

    /**
     * pdf viewer 를 로드한다.
     * @param {string} url
     * @param {object} file - title bar 에 노출할 파일 정보
     */
    function load(url, file) {
      jndPubSub.pub('JndPdfViewer:load', url, file);
      PdfViewer.load(url);
    }
  }
})();
