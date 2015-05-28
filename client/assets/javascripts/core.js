(function(window) {
  /**
   * jnd library
   */
  var jnd = {};

  /**
   * object inheritance pattern을 사용할때 최상위 object
   */
  jnd.object = {
    /**
     * OLOO(objects linked to other objects) style로 inheritance을 위한 object 생성
     * @param {object} prop - object properties
     */
    make: function(prop) {
      var that = this;
      var obj;

      obj = Object.create(that);

      return that.mixin(prop, obj);
    },
    /**
     * object와 object의 property를 base object에 섞음
     * @param {object} prop - base의 properties object
     * @param {object} base - base object
     */
    mixin: function(prop, base) {
      var that = this;
      var target;
      var e;

      target = base || {};
      for (e in prop) {
        if (prop.hasOwnProperty(e)) {
          target[e] = prop[e];
        }
      }

      return target;
    }
  };

  jnd.util = {};

  // Global variable
  window.jnd = jnd;
})(window);