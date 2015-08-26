(function() {
  'use strict';

  //@JiHoon 291
  //@Young Park 11153801
  //@mak pak 3017772

  describe('html.encode.filter', function() {
    var $filter;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
    }));

    it('html entity 로 encode 하는지 확인한다.', function() {
      var htmlEncodeFilter = $filter('htmlEncode');
      var htmlEntityString = '<script> alert(\'test\');</script><a href=\'test\'>';
      var expectString = '&lt;script&gt; alert(&#39;test&#39;);&lt;/script&gt;&lt;a href=&#39;test&#39;&gt;';
      expect(htmlEncodeFilter(htmlEntityString)).toEqual(expectString);
    });
  });
})();
