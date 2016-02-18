var game = angular.module('controllers',[]);



game.controller('home', ['$scope','$state','$ionicPlatform','$http', function($scope,$state,$ionicPlatform,$http){

    $ionicPlatform.ready(function(){

    $ionicPlatform.registerBackButtonAction(function(e){
        e.preventDefault();
      }, 1000);

      $scope.start = function(category){
        $state.go('game', {category_id: category, points: 0});
      }

      loadCategoryList().then(function(categoryList){
        $scope.categories = categoryList.data;
      });

      function loadCategoryList(){
        return $http.get('data/categories.json');
      }

    })
}]);

game.controller('game', ['$scope','$state','$ionicPlatform','$timeout','$http','$ionicPopup',function($scope,$state,$ionicPlatform,$timeout,$http,$ionicPopup){
  
  $ionicPlatform.ready(function(){

    $ionicPlatform.registerBackButtonAction(function(e){
      e.preventDefault();
    }, 1000);

    init();

    $scope.guessLetter = function(index){
      checkLetter(index);

      if(hasMistake()){

        drawHangman();

        if(gameIsLost()){
          $timeout(function(){ gameLostPopUp(); },1000);
        }
      }

      if(wordIsCompleted()){
        
        $timeout(function(){ wordCompletedPopUp(); },1000);
      }
    }



    function init(){
      $scope.game = {};
      $scope.game.player = '';
      $scope.game.alphabet =  ['A','Ą','B','C','Č','D','E','Ę','Ė','F','G','H','I','Į','Y','J','K','L','M','N','O','P','R','S','Š','T','U','Ų','Ū','V','Z','Ž'];
      $scope.game.word = { visible:'',hidden:[]};
      $scope.game.category = {};
      $scope.game.statistics = { mistakes:0, correct:0, points:0 };
      $scope.game.hangman = { animations:[true, true, true, true, true, true, true] };

      $scope.game.statistics.points = $state.params.points;

      loadCategoryWordList($state.params.category_id).then(function(categoryObject){
        var categoryObject = categoryObject.data;
        $scope.game.category = categoryObject;
        getRandomWord(categoryObject);
      });

      var audio = new Audio('sounds/intro.wav');
      audio.play();
    }



    function loadCategoryWordList(category_id){
      return $http.get("data/"+category_id+".json");
    }

    function getRandomWord(categoryObject){
      $scope.game.word.visible = categoryObject.wordlist[Math.floor(Math.random() * categoryObject.wordlist.length)];
      for (var i = 0; i < $scope.game.word.visible.length; i++){
        $scope.game.word.hidden.push({letter:'_', answered :false});
      }
    }

    function checkLetter(index){
      var guessedLetter = $scope.game.alphabet[index];
      $scope.game.alphabet.splice(index, 1);
      $scope.game.statistics.mistake = true;

      for (var i = $scope.game.word.visible.length - 1; i >= 0; i--){
        if($scope.game.word.visible[i] == guessedLetter){

            var audio = new Audio('sounds/correct.mp3');
            audio.play();

            $scope.game.word.hidden[i] = { letter : guessedLetter, answered : true };
            $scope.game.statistics.mistake = false;
            $scope.game.statistics.correct++;
            $scope.game.statistics.points++;
          }
      }
    }

    function hasMistake(){
      if($scope.game.statistics.mistake == true){

        var audio = new Audio('sounds/draw.mp3');
        audio.play();
        
        $scope.game.statistics.mistakes++;

        return true;
      }
      return false;
    }

    function drawHangman(){
      new Vivus("svg_"+$scope.game.statistics.mistakes.toString(), { type: 'delayed', duration: 100});

      $scope.game.hangman.animations[$scope.game.statistics.mistakes - 1] = false;
    }

    function gameIsLost(){
      if($scope.game.statistics.mistakes >= 7){
        return true;
      }

      return false;
    }

    function wordIsCompleted(){
      if($scope.game.word.visible.length == $scope.game.statistics.correct){
        return true;
      }

      return false;
    }

    function gameLostPopUp(){

      var audio = new Audio('sounds/over.mp3');
      audio.play();

      $ionicPopup.show({        
        title:'Žaidimas baigtas !',
        subTitle:'Atspėtos raidės - <b>'+$scope.game.statistics.points+'</b>',
        template:'<center><h4>'+$scope.game.word.visible+'</h4></center>',
        buttons:[
          {
            text:'Pradėti iš naujo',
            type:'button-positive button-outline',
            onTap: function(){
              $state.go('home');
            }
          }
      ]});
    }

    function wordCompletedPopUp(){
      
      var audio = new Audio('sounds/completed.wav');
      audio.play();

      $ionicPopup.show(
      {
        title:'Teisingas atsakymas !',
        subTitle:'Atspėtos raidės - <b>'+$scope.game.statistics.points+'</b>',
        template:'<center><h4>'+$scope.game.word.visible+'</h4></center>',
        buttons:[
          {
            text:'Tęsti',
            type:'button-positive button-outline',
            onTap: function(e) {
             $state.go($state.current, {category_id:$scope.game.category.id, points:$scope.game.statistics.points});
            }
          },
          {
            text:'Užbaigti',
            type:'button-energized button-outline',
            onTap: function(e) {
              recordsPopUp();
            }
          }

        ]
      });
    }

    function recordsPopUp(){
      $ionicPopup.show(
      {
        title:'Įtraukti į rekordus',
        template:'<center><h4>Iš viso atspėta raidžių - <b>'+$scope.game.statistics.points+'</b></h4><input class="player-name" type="text" ng-model="game.player"placeholder="Jūsų vardas"/></center>',
        scope: $scope,
        buttons:[
          {
            text:'Įtraukti',
            type:'button-positive button-outline',
            onTap: function(e) {
              if (!$scope.game.player) {
                e.preventDefault();
              } else {
                var storageRecord = { name : $scope.game.player, points : $scope.game.statistics.points, category : $scope.game.category.category_name}
                addNewRecord(storageRecord);
                $state.go('records');
              }
            }
          },
          {
            text:'Užbaigti',
            type:'button-energized button-outline',
            onTap: function(e) {
              $state.go('home');
            }
          }
        ]
      });
    }

    function addNewRecord(storageRecord){

      var storageRecords = JSON.parse(localStorage["records"] || null);

      if(storageRecords != null){
        storageRecords.sort(function(a, b) {
            return b.points - a.points;
        });

        if(storageRecords.length < 10){
          storageRecords.push(storageRecord);
          console.log('Iki desimt');
        }
        else{
          if(storageRecords[9].points <= storageRecord.points){
            storageRecords[9] = storageRecord;
          }
        }
      }

      else{
        storageRecords = [];
        storageRecords.push(storageRecord);
      }

      localStorage['records'] = JSON.stringify(storageRecords);
    }

  })
}]);


game.controller('records', ['$scope','$ionicPlatform', function($scope,$ionicPlatform){

    $ionicPlatform.ready(function(){

    $ionicPlatform.registerBackButtonAction(function(e){
        e.preventDefault();
      }, 1000);

    $scope.records = JSON.parse(localStorage["records"] || null);
    })
}]);
