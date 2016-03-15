/**
 * @fileoverview Base 서비스. 클래스 정의 및 상속에 대한 메서드를 담고 있다.
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandi.base')
    .service('Base', Base);

  /* @ngInject */
  function Base() {
    var _that = this;

    _that.createObject = _createObject();
    _that.inherit = inherit;
    _that.defineClass = defineClass;

    /**
     * Create a new object with the specified prototype object and properties.
     * @param {Object} obj This object will be a prototype of the newly-created object.
     * @return {Object}
     */
    function _createObject() {
      function F() {}

      return function(obj) {
        F.prototype = obj;
        return new F();
      };
    }

    /**
     * Provide a simple inheritance in prototype-oriented.
     * Caution :
     *  Don't overwrite the prototype of child constructor.
     *
     * @param {function} subType Child constructor
     * @param {function} superType Parent constructor
     * @example
     *  // Parent constructor
     *  function Animal(leg) {
     *      this.leg = leg;
     *  }
     *
     *  Animal.prototype.growl = function() {
     *      // ...
     *  };
     *
     *  // Child constructor
     *  function Person(name) {
     *      this.name = name;
     *  }
     *
     *  // Inheritance
     *  core.inherit(Person, Animal);
     *
     *  // After this inheritance, please use only the extending of property.
     *  // Do not overwrite prototype.
     *  Person.prototype.walk = function(direction) {
     *      // ...
     *  };
     */
    function inherit(subType, superType) {
      var prototype = _that.createObject(superType.prototype);
      prototype.constructor = subType;
      subType.prototype = prototype;
    }

    /**
     * Help a constructor to be defined and to inherit from the other constructors
     * @param {*} [parent] Parent constructor
     * @param {Object} props Members of constructor
     *  @param {Function} props.init Initialization method
     *  @param {Object} [props.static] Static members of constructor
     * @returns {*} Constructor
     * @example
     *  var Parent = defineClass({
     *      init: function() {
     *          this.name = 'made by def';
     *      },
     *      method: function() {
     *          //..can do something with this
     *      },
     *      static: {
     *          staticMethod: function() {
     *               //..do something
     *          }
     *      }
     *  });
     *
     *  var Child = defineClass(Parent, {
     *      method2: function() {}
     *  });
     *
     *  Parent.staticMethod();
     *
     *  var parentInstance = new Parent();
     *  console.log(parentInstance.name); //made by def
     *  parentInstance.staticMethod(); // Error
     *
     *  var childInstance = new Child();
     *  childInstance.method();
     *  childInstance.method2();
     */
    function defineClass(parent, props) {
      var obj;

      if (!props) {
        props = parent;
        parent = null;
      }

      obj = props.init || function(){};

      if(parent) {
        inherit(obj, parent);
      }

      if (props.hasOwnProperty('static')) {
        _.extend(obj, props.static);
        delete props.static;
      }

      _.extend(obj.prototype, props);

      return obj;
    }
  }
})();
