(function() {
    'use strict';

    angular
        .module('jandiApp')
        .directive('leftCustomScroll', leftCustomScroll);

    function leftCustomScroll() {
        var directive = {
            link: link,
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attrs) {
            element.bind('scroll', function scrollHandler() {
            });

            element.bind('mousewheel', function(event) {
            });


        }
    }
})();
