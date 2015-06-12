/**
 * @fileoverview 프리로더
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.preloader')
    .service('Preloader', Preloader);

  /* @ngInject */
  function Preloader($templateCache, configuration) {
    var isLocal = configuration.name === 'local';

    this.img = img;
    this.template = template;

    /**
     * local 과 dev 의 url path 가 다르므로..
     * @param url
     * @returns {*}
     * @private
     */
    function _replacePath(url) {
      if (!isLocal && /^..\//.test(url)) {
        url = url.replace('../', '../app/');
      }
      return url;
    }
    /**
     * image template 을 preload 한다.
     * @param {String|Array} data - preload 할 image url. 복수개의 경우 array 를 넘긴다.
     * @return {Preloader}
     */
    function img(data) {
      var list = [];
      var img;
      if (!_.isArray(data)) {
        list.push(data);
      } else {
        list = data;
      }

      _.forEach(list, function(url) {
        img = new Image();
        img.src = _replacePath(url);
      });
      return this;
    }

    /**
     * html template 을 preload 한다.
     * @param {String|Array} data - preload 할 template url. 복수개의 경우 array 를 넘긴다.
     * @return {Preloader}
     */
    function template(data) {
      var list = [];

      if (!_.isArray(data)) {
        list.push(data);
      } else {
        list = data;
      }

      _.forEach(list, function(url) {
        $templateCache.get(url);
      });
      return this;
    }
  }
})();
