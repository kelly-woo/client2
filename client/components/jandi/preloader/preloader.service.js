/**
 * @fileoverview 프리로더
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandi.preloader')
    .service('Preloader', Preloader);

  /* @ngInject */
  function Preloader($templateCache) {
    var urlInterceptor;
    var that = this;

    this.initialize = initialize;
    this.img = img;
    this.template = template;

    /**
     * 초기화 함수
     * @param {object} [options]
     *    @param {function} [options.urlInterceptor]  - url interceptor
     * @return {Preloader}
     */
    function initialize(options) {
      urlInterceptor = options.urlInterceptor;
      return that;
    }

    /**
     * image template 을 preload 한다.
     * @param {String|Array} data - preload 할 image url. 복수개의 경우 array 를 넘긴다.
     * @return {Preloader}
     */
    function img(data) {
      var list = [];
      var img;
      var hasUrlInterceptor = _.isFunction(urlInterceptor);

      if (!_.isArray(data)) {
        list.push(data);
      } else {
        list = data;
      }

      _.forEach(list, function(url) {
        url = hasUrlInterceptor ? urlInterceptor(url) : url;
        img = new Image();
        img.src = url;
      });

      return that;
    }

    /**
     * html template 을 preload 한다.
     * @param {String|Array} data - preload 할 template url. 복수개의 경우 array 를 넘긴다.
     * @return {Preloader}
     */
    function template(data) {
      var list = [];
      var hasUrlInterceptor = _.isFunction(urlInterceptor);

      if (!_.isArray(data)) {
        list.push(data);
      } else {
        list = data;
      }

      _.forEach(list, function(url) {
        url = hasUrlInterceptor ? urlInterceptor(url) : url;
        $templateCache.get(url);
      });

      return that;
    }
  }
})();
