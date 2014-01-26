'use strict';

var gameApp = angular.module('gameApp', ['ngRoute']);

gameApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/game-select.html',
        controller: 'GameSelectCtrl'
      }).
      when('/:gameName', {
        templateUrl: 'partials/game-play.html',
        controller: 'GamePlayCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
  
var availableGames = [
  {
    name: 'Dinosaurs',
    dataUrl: '/data/dinosaurs.json'
  },
  {
    name: 'Aircraft',
    dataUrl: '/data/aircraft.json'
  }
];

gameApp.controller('GameSelectCtrl', ['$scope', '$location', 
  function($scope, $location){
    $scope.availableGames = availableGames;
    $scope.submit = function(){
      $location.path($scope.gameName);
    };
  }
]);

gameApp.controller('GamePlayCtrl', ['$scope', '$http', '$routeParams', '$location',
  function($scope, $http, $routeParams, $location){
    
    var game = (function(selectedGameName){
      
      var selectedGame;
      
      angular.forEach(availableGames, function(availableGame){
        if(availableGame.name.toLowerCase() === selectedGameName){
          selectedGame = availableGame;
        }
      });
      
      if(!selectedGame) {
        $location.path('');
      }
      return selectedGame;
      
    })($routeParams.gameName.toLowerCase());
    
    $scope.subject = game.name;
    $scope.items = [];
    $scope.questionIndex = 1;
    $scope.correctAnswerCount = 0;
    $scope.gameOver = false;
    
    $scope.onAnswered = function(name){
      if($scope.selectedItem.name === name ){
        // correct answer    
        $scope.correctAnswerCount += 1;
      }
      $scope.questionIndex += 1;
      setRandomSelectedItem();
    };
    
    $scope.reset = function(){
      $scope.questionIndex = 1;
      $scope.correctAnswerCount = 0;
      $scope.gameOver = false;
      angular.forEach($scope.items, function(item){
        item.shown = false;
      });
      setRandomSelectedItem();
    };
  
    $scope.$watch('items.length', function() {
      setRandomSelectedItem();
    });
    $scope.$watch('selectedItem', function() {
      setPotentialAnswers();
    });
  
    $http.get(game.dataUrl).success(function(data) {
      $scope.items = data;
    });
  
    function setRandomSelectedItem() {
      var unselectedItems = $scope.items.filter(function(item){
        return !item.shown;
      });
      
      $scope.selectedItem = unselectedItems[Math.floor(Math.random() * unselectedItems.length)];
      if($scope.selectedItem) {
        $scope.selectedItem.shown = true;
      }
      
      $scope.gameOver = !$scope.selectedItem;
    }
  
    function setPotentialAnswers(desiredNumberOfAnswers) {
    
      if(!desiredNumberOfAnswers){
        desiredNumberOfAnswers = 6;
      }
    
      var answers = [$scope.selectedItem];
      var spares;
    
      while(answers.length < desiredNumberOfAnswers && answers.length < $scope.items.length){

        spares = $scope.items.filter(function(item){
          return answers.indexOf(item) === -1;
        });

        answers.push(spares[Math.floor(Math.random() * spares.length)]);
      }
    
      $scope.answers = answers;
    }
  }
]);
