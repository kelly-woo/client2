/**
 * @fileoverview 콜렉션 클래스 생성자를 반환한다.
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('EntityCollection', EntityCollection);

  /* @ngInject */
  function EntityCollection(CoreCollection, CoreUtil) {

    /**
     * Collection Class
     * @constructor
     */
    var EntityCollectionClass = CoreUtil.defineClass(CoreCollection, /**@lends Collection.prototype */{
      /**
       * 인자로 받은 option 값에 대해 초기 세팅을 한다.
       * @param {Object} options
       *    @param {String} [options.key='id'] - key 값으로 사용할 field 명
       *    @param {Array} [options.list] - 생성과 동시에 설정할 콜렉션 list
       * @private
       */
      init: function(options) {
        CoreCollection.prototype.init.apply(this, arguments);
      },

      /**
       * item 을 추가한다.
       * @override
       * @param {object} item
       */
      add: function(item) {
        //@fixme: 현재 entity.service.js 의 extend 에서 's' 를 붙여주는 로직에 대한 호환성을 위해 아래와 같은 로직을 수행한다.
        if (item.type) {
          item.type = item.type.toLowerCase() + 's';
        }
        CoreCollection.prototype.add.call(this, item);
      }
    });

    return EntityCollectionClass;
  }
})();
