(function() {
    angular
        .module('jandiApp')
        .controller('mobileCatcherController', mobileCatcherController);

    function mobileCatcherController($scope, $rootScope, configuration, publicService, storageAPIservice) {

        (function() {
            $('.mobile-catcher').height($(window).height())

            $('.signin-mobile-background-img').bind('load', function() {
                $('.mobile-catcher').css('opacity', 1);
            })
        })();

        $scope.toMobileApplication = function() {
            var url_to_app, url_to_store;

            var access_token = storageAPIservice.getAccessToken();
            if (!access_token) access_token = '';
            var refresh_token = storageAPIservice.getRefreshToken();
            if (!refresh_token) refresh_token = '';

            url_to_app = 'tosslabjandi://open?access_token=' + access_token + '&refresh_token=' + refresh_token;

            if ($scope.isAndroid) {
                url_to_store = configuration.play_store_address;
            }
            else {
                url_to_store = configuration.app_store_address;
            }

            startApp(url_to_app, url_to_store);
        };

        var timeout;
        function preventPopup() {
            clearTimeout(timeout);
            timeout = null;
            window.removeEventListener('pagehide', preventPopup);
        }

        function startApp(url_to_app, url_to_store) {
            publicService.redirectTo(url_to_app);
            timeout = setTimeout(function(){
                if(confirm('잔디앱이 설치되어 있지않습니다.')){
                    publicService.redirectTo(url_to_store);
                }
            }, 1000);
            window.addEventListener('pagehide', preventPopup);
        }


        $scope.isLang = function(lang) {
            return $rootScope.language == lang;
        };
    }
})();