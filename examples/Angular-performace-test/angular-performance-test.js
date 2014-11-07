function TodoCtrl($scope) {
  $scope.children = [
    {Name:'Andrew', Age: 20, checked:true, time: new Date},
    {Name:'Peter', Age: 25, checked:false, time: new Date}];
  
  $scope.allNames = function() {
	console.log('All name should be calculated');
	var allNames = '';
	for (var i = 0, j = $scope.children.length; i < j; i++) {
	  allNames += $scope.children[i].name + '<br />';
	}
	return allNames;
  };
  
  $scope.checkAllChange = function(){
    var checked = (window.event.srcElement || window.event.target).checked;
    for (var i = 0, j = $scope.children.length; i < j; i++) {
	  $scope.children[i].checked = checked;
	}
  }
  $scope.checkAll = function() {
    var checked = false;
    for(var i = 0, j = $scope.children.length; i < j; i++){
      if(!$scope.children[i].checked) {
        return false;
      }
    }
    return true;
  };
  $scope.deletePerson = function(index) {
    $scope.children.splice(index, 1);
  };
  
  $scope.deleteAll = function() {
    for(var i = 0, j = $scope.children.length; i < j; i++){
      if($scope.children[i].checked){
        $scope.children.splice(i, 1); i--; j--;
      }
    }
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