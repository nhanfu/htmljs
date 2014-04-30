function TodoCtrl($scope) {
  $scope.children = [
    {Name:'Andrew', Age: 20, checked:true, time: new Date},
    {Name:'Peter', Age: 25, checked:false, time: new Date}];
  
  $scope.checkAllChange = function(){
    
  }
  $scope.checkAll = function(){
    var checked = false;
    for(var i = 0, j = $scope.children.length; i < j; i++){
      if(!$scope.children[i].checked){
        return false;
      }
    }
    return true;
  };
  $scope.deletePerson = function(index) {
    $scope.children.splice(index, 1);
  };
 
 $scope.add1 = function() {
    $scope.children.push({Name: 'Nhan', Age: 25, checked: false, time: new Date});
  };
  
  $scope.add1000 = function() {
    var start = new Date;
    for(var i=  0; i < 1000; i++){
        $scope.children.push({Name: 'Nhan', Age: 25, checked: false, time: new Date});
    }
    var stop = new Date;
    alert(start - stop);
  };
  
  $scope.add2000 = function() {
    var start = new Date;
    for(var i=  0; i < 2000; i++){
        $scope.children.push({Name: 'Nhan', Age: 25, checked: false, time: new Date});
    }
    var stop = new Date;
    alert(start - stop);
  };
 
  $scope.add3000 = function() {
    var start = new Date;   
    for(var i=  0; i < 3000; i++){
        $scope.children.push({Name: 'Nhan', Age: 25, checked: false, time: new Date});
    }
    var stop = new Date;
    alert(start - stop);
  };
  
  $scope.add10000 = function() {
	$scope.children = [];
	var childs = [];
    for(var i=  0; i < 10000; i++){
        childs.push({Name: 'Nhan', Age: 25, checked: false, time: new Date});
    }
	$scope.children = childs;
  };
}