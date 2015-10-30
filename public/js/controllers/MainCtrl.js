'use strict';

/* MAIN Controller */

angular.module('zoinks')
  .controller('MainCtrl', ['$scope', '$rootScope', '$location', 'Auth', 'Zoink', '$auth',  function($scope, $rootScope, $location, Auth, Zoink, $auth) {
    // ZOINKS
    $scope.zoinks = Zoink.query();

    // NEW ZOINK
    $scope.zoink = {};

    $scope.createZoink = function() {
      console.log('hello')
      var zoink = new Zoink($scope.zoink)
      zoink.$save(function(zoink) {
        $location.path('/zoinks/' + zoink._id)
        $('#new-zoink').modal('hide');
      });
    }

    // LOGIN/REGISTER
    $scope.signupMode = false;
    $scope.user = {};

    $scope.isAuthenticated = function() {
      console.log("loggedin?: ", $auth.isAuthenticated())
      return $auth.isAuthenticated();
    };

    $scope.loggedIn = $scope.isAuthenticated();

    $rootScope.$on('loggedIn', function() {
      $scope.loggedIn = true;
    });
    console.log(Auth.currentUser())

    $scope.signup = function() {
      $auth.signup($scope.user)
        .then(function(response) {
          $auth.setToken(response);
          $rootScope.$broadcast('loggedIn');
          $scope.$apply(function() {
            $('#login-modal').modal('hide');
          });
          // toastr.info('You have successfully created a new account and have been signed-in');
        })
        .catch(function(response) {
          // toastr.error(response.data.message);
        });
    };

    $scope.login = function() {
      $auth.login($scope.user)
        .then(function() {
          // toastr.success('You have successfully signed in');
          $auth.setToken(response);
          $rootScope.$broadcast('loggedIn');
          $scope.$apply(function() {
            $('#login-modal').modal('hide');
          });
        })
        .catch(function(response) {
          // toastr.error(response.data.message, response.status);
        });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function() {
          // toastr.success('You have successfully signed in with ' + provider);
          $('#login-modal').modal('hide');
          $scope.loggedIn = $scope.isAuthenticated();
        })
        .catch(function(response) {
          // toastr.error(response.data.message);
        });
    };

    $scope.logout = function() {
      $auth.logout()
        .then(function() {
          // toastr.info('You have been logged out');
          $auth.removeToken();
          $scope.loggedIn = $scope.isAuthenticated();
        });
    };
  }]);