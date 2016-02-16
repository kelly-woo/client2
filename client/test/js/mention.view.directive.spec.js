(function() {
  'use strict';

  xdescribe('mention.view.directive', function() {
    var $compile;
    var $rootScope;
    var baseData;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function (_$compile_, _$rootScope_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
      jasmine.getJSONFixtures().fixturesPath = 'base/client/test/mock/';
      baseData = loadJSONFixtures('baseData.json')['baseData.json'];
      _.extend($rootScope, baseData);
    }));

    it('Replaces the element with the appropriate content', function () {
      //console.log('test');
      //var element = $compile("<span mention-view='11153801'>@Young Park</span>")($rootScope);
      //console.log('test2');
      //$rootScope.$digest();
      //console.log('test3');
      //expect(element.hasClass('mention')).toBe(true);
      //expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
    });
  });
})();
