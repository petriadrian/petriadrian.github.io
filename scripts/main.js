/**
 * Constants
 */
var RO_LOCALE = 'ro';
var EN_LOCALE = 'en';

/**
 * Main AngularJS Web Application
 */
var app = angular.module('appFunctionality', ['ui.router', 'ngAnimate', 'ui.bootstrap']);

/**
 * Initialization
 */
app.run(function ($rootScope, $window, $anchorScroll, $location, $http, localizationService) {
    // lazy loading for pageContent - needed for metadata which are needed before the controllers are called
    $rootScope.pageContent = {};
    $rootScope.scrollTo = function (id) {
        var old = $location.hash();
        $location.hash(id);
        $anchorScroll();
        $location.hash(old);
    };
    //get Articles function
    $rootScope.getArticles = function (categoryArticles, idsOfTheNeededArticles) {
        var path = 'content/' + localizationService.language + '/common/articles/' + categoryArticles + '.json';
        var neededArticlesIds = [];
        $.each(idsOfTheNeededArticles, function (key, neededArticle) {
            neededArticlesIds.push(neededArticle.id);
        });
        var finalItems = new Array(neededArticlesIds.length);
        $http.get(path).success(function (loadedArticles) {
            $.each(loadedArticles, function (key, loadedArticle) {
                var itemPosition = neededArticlesIds.indexOf(loadedArticle.id);
                if (itemPosition > -1) {
                    finalItems[itemPosition] = loadedArticle;
                }
            });
        });
        return finalItems;
    };
});

/**
 * Configure the Routes
 */
app.config(['$urlRouterProvider', '$stateProvider', '$locationProvider', function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $stateProvider
        .state('initHome', {
            url: '/',
            templateUrl: 'partials/defaultTemplate.html',
            controller: function ($window, localizationService) {
                //detect language And Redirect
                $window.location.href = localizationService.language + '/home';
            }
        })
        .state('default', {
            url: '*path',
            templateUrl: 'partials/defaultTemplate.html', controller: "DefaultPageCtrl"
        })
}]);

/**
 * Controllers
 */
app.controller('DefaultPageCtrl', function ($scope, $rootScope, $location, $http, $timeout, $anchorScroll) {
    var pageContentPath = 'content' + $location.$$path + '.json';
    $http.get(pageContentPath).success(function (pageContentResult) {
        $rootScope.pageContent = pageContentResult;
    });
    // if the needed location has an anchor then scroll to it only after the page is loaded
    if ($location.hash()) {
        $timeout(function () {
            $anchorScroll($location.hash());
        }, 1200);
    }
});

app.controller('HeaderCtrl', function ($scope, $rootScope, $window, $http, localizationService) {
    var translatedContentPath = 'content/' + localizationService.language + '/common/header.json';
    $http.get(translatedContentPath).success(function (translatedContentResult) {
        $scope.headerContent = translatedContentResult;
    });
    $rootScope.localizationService = localizationService;
});

app.controller('FooterCtrl', function ($scope, $rootScope, $http, $timeout, localizationService) {
    // get reviews page content for presentation
    var reviewsPagePath = 'content/' + localizationService.language + '/review.json';
    $http.get(reviewsPagePath).success(function (reviewPageContentResult) {
        $scope.reviewPageContent = reviewPageContentResult;
    });
    // get reviews articles
    var reviewsArticlesPath = 'content/' + localizationService.language + '/common/articles/reviews.json';
    $http.get(reviewsArticlesPath).success(function (reviewArticles) {
        $scope.reviews = reviewArticles;
    });
    // get footer content
    var footerContentPath = 'content/' + localizationService.language + '/common/footer.json';
    $http.get(footerContentPath).success(function (footerContentResult) {
        $scope.footerContent = footerContentResult;
    });
});

app.controller('GetOtherPageContentCtrl', function ($scope, $rootScope, $http) {
    var pageToLoadPath = 'content/' + $scope.otherPagePath + '.json';
    $http.get(pageToLoadPath).success(function (pageResult) {
        $scope.otherPageContent = pageResult;
    });
});

app.controller('GetCategoryArticlesCtrl', function ($scope, $rootScope) {
    $scope.categoryArticles = $rootScope.getArticles($scope.categoryArticles.category, $scope.categoryArticles.ids);
});

/**
 * Filters
 */
app.filter('trustUrl', ['$sce', function ($sce) {
    return function (url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);

app.filter('trustHtml', ['$sce', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html);
    };
}]);

app.filter('removeHtmlFromText', function () {
        return function (text) {
            return text ? String(text).replace(/<[^>]+>/gm, '') : '';
        };
    }
);

function toggleSection(button) {
    $('input[name="dataRange"]').daterangepicker();
    $(button.parentNode).find(".areaToBeHided").toggle(300);
}

app.factory('localizationService', function ($window, $location) {
    var factory = {};
    factory.language = "";
    if ($location.$$path.indexOf("/" + RO_LOCALE + "/") > -1) {
        factory.language = RO_LOCALE;
    } else if ($location.$$path.indexOf("/" + EN_LOCALE + "/") > -1) {
        factory.language = EN_LOCALE;
    } else {
        factory.language = navigator.language || navigator.userLanguage;
        if (factory.language.indexOf(RO_LOCALE) > -1) {
            factory.language = RO_LOCALE;
        } else {
            factory.language = EN_LOCALE;
        }
    }
    factory.changeLanguage = function (newLang) {
        var actulPathWithoutLang = $location.$$path.substring(3);
        $window.location.href = '/' + newLang + actulPathWithoutLang;
    };
    return factory;
});

app.directive('sectionForm', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            section: '='
        },
        templateUrl: 'templates/_form.tmpl.htm',
        link: function (scope, element, attrs) {
            scope.formObj = {};
            scope.responseMessage = '';
            scope.showResponse = false;
            scope.messageType = 'success';
            scope.addNewField = function (collectionWhereToAdd, fieldToBeAdded) {
                collectionWhereToAdd.push(angular.copy(fieldToBeAdded));
            };
            scope.removeLastField = function (collectionToRemoveFrom) {
                var lastItem = collectionToRemoveFrom.length - 1;
                collectionToRemoveFrom.splice(lastItem);
            };
            scope.sendEmailFromForm = function () {
                scope.formLoading = true;
                scope.formObj.title = scope.section.sendEmailTitle;
                $.ajax({
                    type: 'POST',
                    url: '/scripts/send_mail.php',
                    data: scope.formObj,
                    dataType: 'json',
                    success: function (data) {
                        for (var field in scope.formObj) {
                            scope.formObj[field] = '';
                        }
                        if (data.status == "success") {
                            //success
                            console.log("success", JSON.stringify(data));
                            scope.showResponse = true;
                            scope.responseMessage = scope.section.successMessage;
                            scope.messageType = 'success';
                        }
                        else {
                            // error
                            console.log("error", JSON.stringify(data));
                            scope.showResponse = true;
                            scope.responseMessage = scope.section.errorMessage || "ERROR";
                            scope.messageType = 'error';
                        }
                        scope.formObj = {};
                        scope.formLoading = false;
                        scope.$apply();
                        $timeout(function () {
                            scope.showResponse = false;
                            scope.$apply();
                        }, 30000);
                    },
                    error: function (errorThrown) {
                        for (var field in scope.formObj) {
                            scope.formObj[field] = '';
                        }
                        scope.formObj = {};
                        console.log("error while sending form to email", errorThrown);
                        scope.responseMessage = scope.section.errorMessage || "ERROR";
                        scope.messageType = 'error';
                        scope.showResponse = true;
                        scope.formLoading = false;
                        scope.$apply();
                    }
                });
            }
        }
    }
});

// make menu from headline stick to the top on scroll
(function ($) {
    $(document).ready(function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 300) {
                $("#stickHeaderBarOnTheTop").fadeIn(200);
                $("#stickPageIntroMenuOnTheTop").addClass("showPageIntroBar").fadeIn();
            } else {
                $("#stickHeaderBarOnTheTop").fadeOut();
                $("#stickPageIntroMenuOnTheTop").removeClass("showPageIntroBar");
            }
        });
    });
})(jQuery);