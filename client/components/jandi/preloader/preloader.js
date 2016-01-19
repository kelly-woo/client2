/**
 * @fileoverview 프리로더
 * @author young.park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandi.preloader', [])
    .config(config)
    .run(run);

  var _isLocal;
  var _path;
  var _templateList;
  var _imgList;

  /* @ngInject */
  function config(configuration, PRELOAD_LIST) {
    _isLocal = configuration.name === 'local';
    _path = configuration.path || '';
    _templateList = [
      'app/disconnect/disconnect.html'
    ];
    _imgList = [];
    _imgList = _imgList.concat(PRELOAD_LIST);
  }

  /* @ngInject */
  function run(Preloader) {
    Preloader.initialize({
      urlInterceptor: _urlInterceptor
    });

    Preloader
      .template(_templateList)
      .img(_imgList);
  }

  /**
   * Preloader 에 설정할 url interceptor
   * @param {string} url
   * @returns {string}
   * @private
   */
  function _urlInterceptor(url) {
    if (!_isLocal && /^..\//.test(url)) {
      url = url.replace('../', '../' + _path);
    }
    return url;
  }
})();
