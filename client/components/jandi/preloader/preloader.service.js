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
    var that = this;
    var _urlInterceptor;
    var _imgMap = {};
    var _jqImgContainer = $('<div>');

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
      _urlInterceptor = options.urlInterceptor;
      _appendImgContainer();
      return that;
    }

    /**
     * image template 을 preload 한다.
     * @param {String|Array|object} data - preload 할 image url. 복수개의 경우 array|object 를 넘긴다.
     * @return {Preloader}
     */
    function img(data) {
      var list = [];

      if (_.isObject(data) || _.isArray(data)) {
        list = data;
      } else {
        list.push(data);
      }

      _.forEach(list, function(url) {
        setTimeout(_.bind(_appendImg, null, url), 100);
      });

      return that;
    }

    /**
     * append image
     * @param {string} url
     * @private
     */
    function _appendImg(url) {
      var img;
      var hasUrlInterceptor = _.isFunction(_urlInterceptor);

      url = hasUrlInterceptor ? _urlInterceptor(url) : url;
      if (!_imgMap[url]) {
        img = new Image();
        img.src = url;
        $(img).css({
          width: '1px',
          height: '1px',
          visibility: 'hidden'
        }).on('load', _onComplete)
          .on('error', _onComplete);

        _imgMap[url] = true;
        _jqImgContainer.append(img);
      }
    }

    /**
     * load 완료 시 콜백
     * @param {object} domEvemt
     * @private
     */
    function _onComplete(domEvemt) {
      //$(domEvemt.target).css('display', 'none');
    }

    /**
     * html template 을 preload 한다.
     * @param {String|Array} data - preload 할 template url. 복수개의 경우 array 를 넘긴다.
     * @return {Preloader}
     */
    function template(data) {
      var list = [];
      var hasUrlInterceptor = _.isFunction(_urlInterceptor);

      if (!_.isArray(data)) {
        list.push(data);
      } else {
        list = data;
      }

      _.forEach(list, function(url) {
        url = hasUrlInterceptor ? _urlInterceptor(url) : url;
        $templateCache.get(url);
      });

      return that;
    }

    /**
     * img container 를 append 한다.
     * @private
     */
    function _appendImgContainer() {
      _jqImgContainer.css({
        zIndex: 0,
        width: '1px',
        height: '1px',
        top: 0,
        left: 0,
        position: 'absolute',
        visibility: 'hidden'
      });
      $('body').append(_jqImgContainer);
    }
  }
})();
