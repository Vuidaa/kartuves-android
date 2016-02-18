var app = angular.module('kartuves', 
  ['ionic', 
  'ngFitText',
  'services',
  'controllers'])
.run(function($ionicPlatform) {

  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($ionicConfigProvider) {
 // $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.scrolling.jsScrolling(true);
  $ionicConfigProvider.views.transition('none');
  $ionicConfigProvider.spinner.icon('bubbles');
});

app.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/');

    $stateProvider.state('home', {
        cache: false,
        url: '/',
        templateUrl: 'templates/home.html'
    });

    $stateProvider.state('game', {
        cache: false,
        url: '/game',
        templateUrl: 'templates/game.html',
        params: {category_id: null, points: 0}
    });

   $stateProvider.state('records', {
        cache: false,
        url: '/records',
        templateUrl: 'templates/records.html'
    });

});