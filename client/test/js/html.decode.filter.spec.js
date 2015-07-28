(function() {
  'use strict';

  //@JiHoon 291
  //@Young Park 11153801
  //@mak pak 3017772

  describe('html.decode.filter', function() {
    var $filter;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
    }));

    it('html entity 를 decode 하는지 확인한다.', function() {
      var htmlDecodeFilter = $filter('htmlDecode');
      var htmlEntityString = 'A &#39;quote&#39; is &lt;b&gt;bold&lt;/b&gt;';
      var expectString = 'A \'quote\' is <b>bold</b>';

      expect(htmlDecodeFilter(htmlEntityString)).toEqual(expectString);
    });
  });
})();
