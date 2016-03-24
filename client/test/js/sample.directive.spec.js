/**
 * @fileoverview Sample directive test code
 *
 * @see https://docs.angularjs.org/guide/unit-testing
 * @see http://busypeoples.github.io/post/testing-angularjs-directives/
 * @see http://daginge.com/technology/2013/12/14/testing-angular-templates-with-jasmine-and-karma/
 * @see http://www.sitepoint.com/angular-testing-tips-testing-directives/
 */
(function() {
  'use strict';

  xdescribe('Directive Test Sample', function() {
    var $compile;
    var $rootScope;
    var $scope;

    beforeEach(module('jandiApp'));
    beforeEach(module('templates'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      $scope = _$rootScope_.$new();
    }));

    it('Do your test', function () {
      $scope.isActive = true;
      var element = $compile("<switch-button is-active='isActive'></switch-button>")($scope);
      $scope.$digest();
      //This test will fail
      expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
    });
  });
})();
