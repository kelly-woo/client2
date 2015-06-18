(function() {
  'use strict';

  /**
  * @desc Page View Event Tracker. View 파일에 Element 형태로 추가된다.
          Page를 조회할 때, GA와 로그서버로 이벤트를 전송한다.
  * @example <page-tracker page="main" title="Main"></page-tracker>
  */

  angular
    .module('app.analytics')
    .directive('pageTracker', pageTracker);

  pageTracker.$inject = ['GAHelper', 'analyticsHelper', 'analyticsConstant']

  function pageTracker(GAHelper, analyticsHelper, analyticsConstant){
    return {
      restrict: 'EA',
      link: linkFunc
    };

    function linkFunc(scope, element, attributes) {
      var page = attributes.page;
      var title = attributes.title;
      var isValid = validationCheck(page, title);
      console.log(page, title);
      if (isValid){
        //Send Data to Google Analytics
        GAHelper.pageTrack(page, title);

        //Send Data to Log Server
        var property = {};
        property[analyticsConstant.PROPERTY.PAGE] = analyticsConstant.PAGE[page];
        property[analyticsConstant.PROPERTY.BROWSER_HEIGHT] = window.innerHeight || document.body.clientHeight;
        property[analyticsConstant.PROPERTY.BROWSER_WIDTH] = window.innerWidth || document.body.clientWidth;
        // property[analyticsConstant.PROPERTY.LANGUAGE] = generalService.getServerLang();
        analyticsHelper.track(analyticsHelper.EVENT.PAGE_VIEWED, property);
      } else {
        analyticsHelper.error('PageTracker or PageTracker Undefined. Page: ' + page + ', title: ' + title, 'PageTracker.directive');
      }
    }



    /**
     * Directive 에 전달된 page 와 title의 유효성을 검사한다. 
     * @returns {Boolean} 
     */
    function validationCheck(page, title) {
      if (_.isUndefined(page)) {
        analyticsHelper.error('page is undefined', 'pageTracker');
        return false;
      } else if (_.isUndefined(title)) {
        analyticsHelper.error('title is undefined', 'pageTracker');
        return false;
      } else if (_.isUndefined(analyticsConstant.PAGE[page])) {
        analyticsHelper.error('page is not in Constant Service page='+page, 'pageTracker');
        return false;
      }
      return true;
    }
  }

})();
