'use strict';

var app = angular.module('jandiApp');

app.controller('errorController', function($scope, $modal, userAPIservice) {
    $scope.openModal = function(selector) {
        // OPENING JOIN MODAL VIEW
        if (selector == 'agreement') {

            var agreement = 'app/modal/terms/agreement';
            var lang = userAPIservice.getUserLanguage();
            agreement = agreement + '_' + lang + '.html';

            $modal.open({
                scope       :   $scope,
                templateUrl :   agreement,
                size        :   'lg'
            });
        }
        else if (selector == 'privacy') {
            var privacy = 'app/modal/terms/privacy';
            var lang = userAPIservice.getUserLanguage();
            privacy = privacy + '_' + lang + '.html';

            $modal.open({
                scope       :   $scope,
                templateUrl :   privacy,
                size        :   'lg'
            });
        }
    };
});
