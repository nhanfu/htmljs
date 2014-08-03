module('Test common function - array');
test('Basic functions added to an array after calling html.array', function(){
    var sut = html.array([1,2,3,4]);
    ok(sut.add, 'ok, add method has been added to the array');
    ok(sut.addRange, 'ok, addRange method has been added to the array');
    ok(sut.each, 'ok, each method has been added to the array');
    ok(sut.select, 'ok, select method has been added to the array');
    ok(sut.where, 'ok, where method has been added to the array');
    ok(sut.reduce, 'ok, reduce method has been added to the array');
    ok(sut.reduceRight, 'ok, reduceRight method has been added to the array');
    ok(sut.find, 'ok, reduceRight method has been added to the array');
    ok(sut.first, 'ok, first method has been added to the array');
    ok(sut.firstOrDefault, 'ok, firstOrDefault method has been added to the array');
    ok(sut.remove, 'ok, remove method has been added to the array');
    ok(sut.removeAt, 'ok, removeAt method has been added to the array');
    ok(sut.orderBy, 'ok, orderBy method has been added to the array');
});

test('Test add method in html.array', function(){
    var sut = html.array([1,2,3,4]);
    sut.add(5);
    ok(sut.length === 5, 'An element has been added to the array');
});

test('Test add method in html.array', function(){
    var sut = html.array([1,2,3,4]);
    sut.add();
    ok(sut.length === 4, 'No element has been added to the array');
});

test('Test select method in html.array - no mapper', function(){
    var sut = html.array([1,2,3,4]);
    throws(
        function() {
            sut.select();
        },
        "Mapping function is required"
    );
});

test('Test select method in html.array - simple mapper', function(){
    var sut = html.array([1,2,3,4]);
    var res = sut.select(function(x){return x+1;});
    
    ok(res[0] === sut[0] + 1, 'ok, increased 1 at index 0');
    ok(res[2] === sut[2] + 1, 'ok, increased 1 at index 2');
    ok(res[3] === sut[3] + 1, 'ok, increased 1 at index 3');
});

test('Test select method in html.array - square mapper', function(){
    var sut = html.array([1,2,3,4]);
    var res = sut.select(function(x){return x*x;});
    
    ok(res[0] === sut[0]*sut[0], 'ok, squared element at index 0');
    ok(res[2] === sut[2]*sut[2], 'ok, squared element at index 2');
    ok(res[3] === sut[3]*sut[3], 'ok, squared element at index 3');
});

test('Test select method in html.array - null mapper', function(){
    var sut = html.array([1,2,3,4]);
    var res = sut.select(function(x){return null;});
    
    ok(res.length === sut.length, 'number of elements are equal');
    ok(res[0] === null, 'return null at index 0');
});

test('Test method where in html.array - no predicate function', function(){
    var sut = html.array([1,2,3,4]);
    throws(
        function(){
            var res = sut.where();
        },
        'Predicate function is required'
    );
});

test('Test method where in html.array - simple predicate, no result', function(){
    var sut = html.array([1,2,3,4]);
    var res = sut.where(function(x){return x > 5;});
    
    equal(res.length, 0, 'Return array only contains no element');
});

test('Test method where in html.array - simple predicate, got result', function(){
    var sut = html.array([1,2,3,4]);
    var res = sut.where(function(x){return x > 2;});
    
    equal(res.length, 2, 'Returned array only contains 2 elements');
    equal(res[0], 3, 'Result at index 0 equal to 3');
});

test('Test method where in html.array - complex predicate, got result', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}]);
    var res = sut.where(function(x){return x.Name ==='Nhan';});
    
    equal(res.length, 1, 'Returned array only contains 1 element');
    deepEqual(res[0], {Name: 'Nhan', Age: 25}, 'Result at index 0 : {Name: \'Nhan\', Age: 25}');
});

test('Test method where in html.array - complex predicate, got 2 elements', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var res = sut.where(function(x){return x.Name ==='Nhan' || x.Age === 12;});
    
    equal(res.length, 2, 'Returned array only contains 2 elements');
    deepEqual(res[0], {Name: 'Nhan', Age: 25}, 'Result at index 0 : {Name: \'Nhan\', Age: 25}');
    deepEqual(res[1], {Name: 'test', Age: 12}, 'Result at index 0 : {Name: \'test\', Age: 25}');
});

test('Test method reduce in html.array, no iterator', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    throws(
        function(){
            var res = sut.reduce();
        },
        'Iterator function is required'
    );
});

test('Test method reduce in html.array, sum age', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var sum = sut.reduce(function(x, y){return x+y.Age}, 0);
    
    ok(sum === 1237, 'Sum age of people 1237');
});

test('Test method reduce in html.array, greatest age', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var oldest = sut.reduce(function(x, y){return x.Age>y.Age? x: y}, sut[0]);
    
    ok(oldest.Age === 1200, 'Oldest guy is 1200 years old');
});

test('Test method reduce in html.array, least age', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var oldest = sut.reduce(function(x, y){return x.Age<y.Age? x: y}, sut[0]);
    
    ok(oldest.Age === 12, 'Youngest guy is 1200 years old');
});

test('Test method find in html.array, least age', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var oldest = sut.reduce(function(x, y){return x.Age<y.Age? x: y});
    
    ok(oldest.Age === 12, 'Youngest guy is 1200 years old');
});

test('Test method find in html.array, greatest age', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var oldest = sut.reduce(function(x, y){return x.Age>y.Age? x: y});
    
    ok(oldest.Age === 1200, 'Oldest guy is 1200 years old');
});

test('Test method first in html.array - first one without any condition', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var first = sut.first();
    
    deepEqual(first, {Name: 'Nhan', Age: 25}, "The first one is {Name: 'Nhan', Age: 25}");
});

test('Test method first in html.array - first one named "Nhan"', function(){
    var sut = html.array([{Name: "no one", Age: 1200}, {Name: "Nhan", Age: 12}, {Name: 'Nhan', Age: 25}]);
    var first = sut.first(function(x){return x.Name === 'Nhan';});
    
    deepEqual(first, {Name: 'Nhan', Age: 12}, "The first one is {Name: 'Nhan', Age: 12}");
});

test('Test method first in html.array - first one has 12 years old', function(){
    var sut = html.array([{Name: "no one", Age: 1200}, {Name: "Nhan", Age: 12}, {Name: 'Another Nhan', Age: 12}]);
    var first = sut.first(function(x){return x.Age === 12;});
    
    deepEqual(first, {Name: 'Nhan', Age: 12}, "The first one is {Name: 'Nhan', Age: 12}");
});

test('Test method first in html.array - no element matches the predicate', function(){
    var sut = html.array([{Name: "no one", Age: 1200}, {Name: "Nhan", Age: 12}, {Name: 'Another Nhan', Age: 12}]);
    throws(
        function(){
            var first = sut.first(function(x){return x.Name === 'No matched element';});
        },
        'Can\'t find any element matches'
    )
});

test('Test method firstOrDefault in html.array - first one without any condition', function(){
    var sut = html.array([{Name: 'Nhan', Age: 25}, {Name: "test", Age: 12}, {Name: "no one", Age: 1200}]);
    var first = sut.firstOrDefault();
    
    deepEqual(first, {Name: 'Nhan', Age: 25}, "The first one is {Name: 'Nhan', Age: 25}");
});

test('Test method firstOrDefault in html.array - first one named "Nhan"', function(){
    var sut = html.array([{Name: "no one", Age: 1200}, {Name: "Nhan", Age: 12}, {Name: 'Nhan', Age: 25}]);
    var first = sut.firstOrDefault(function(x){return x.Name === 'Nhan';});
    
    deepEqual(first, {Name: 'Nhan', Age: 12}, "The first one is {Name: 'Nhan', Age: 12}");
});

test('Test method firstOrDefault in html.array - first one has 12 years old', function(){
    var sut = html.array([{Name: "no one", Age: 1200}, {Name: "Nhan", Age: 12}, {Name: 'Another Nhan', Age: 12}]);
    var first = sut.firstOrDefault(function(x){return x.Age === 12;});
    
    deepEqual(first, {Name: 'Nhan', Age: 12}, "The first one is {Name: 'Nhan', Age: 12}");
});

test('Test method firstOrDefault in html.array - no element matches the predicate', function(){
    var sut = html.array([{Name: "no one", Age: 1200}, {Name: "Nhan", Age: 12}, {Name: 'Another Nhan', Age: 12}]);
    var first = sut.firstOrDefault(function(x){return x.Name === 'No matched element';});
    
    ok(first === null, 'No element founded, return null');
});

test('Test method indexOf in html.array - not found', function(){
    var sut = html.array([1,2,3,4,5,6,7,8]);
    var index = sut.indexOf(9);
    
    ok(index === -1, 'Not found');
});

test('Test method indexOf in html.array - index of 100', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    var index = sut.indexOf(100);
    
    ok(index === 5, 'Index of 100 in array is 5');
});

test('Test method indexOf in html.array - index of 8', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    var index = sut.indexOf(8);
    
    ok(index === 7, 'Index of 8 in array is 7');
});

test('Test method remove in html.array - remove 8 from list', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    ok(sut.length === 8, 'Length of the array is now 8');
    
    sut.remove(8);
    
    ok(sut.length === 7, 'Remove 8, the length of the array is now 7');
});

test('Test method remove in html.array - remove 25 but not in the list', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    ok(sut.length === 8, 'Length of the array is now 8');
    
    sut.remove(25);
    
    ok(sut.length === 8, 'Remove 25 but 25 is not in the lust, the array is still 8');
});

test('Test method removeAt in html.array - removeAt index 2', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    ok(sut.length === 8, 'The length of the array is now 8');
    
    sut.removeAt(2);
    
    ok(sut.length === 7, 'Remove at index 2, the array now has 7 elements');
});

test('Test method removeAt in html.array - no parameter', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    ok(sut.length === 8, 'The length of the array is now 8');
    
    sut.removeAt();
    
    ok(sut.length === 8, 'Nothing happens, this means you should pass index what from you want to remove');
});

test('Test method removeAt in html.array - index out of range', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    ok(sut.length === 8, 'The length of the array is now 8');
    
    sut.removeAt(20);
    
    ok(sut.length === 8, 'Nothing happens, this means you should pass correct index what from you want to remove');
});

test('Test method removeAt in html.array - index out of range', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
    ok(sut.length === 8, 'The length of the array is now 8');
    
    sut.removeAt(20);
    
    ok(sut.length === 8, 'Nothing happens, this means you should pass correct index what from you want to remove');
});

test('Test method swap in html.array - swap 2 elements at 2 and 5', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
	ok(sut[2] === 3, 'Item at index 2 is 3');
	ok(sut[4] === 5, 'Item at index 3 is 5');
	sut.swap(2, 4);
	
    ok(sut[2] === 5, 'Item at index 2 is 3 after swapping');
    ok(sut[4] === 3, 'Item at index 4 is 3 after swapping');
});

test('Test method swap in html.array - swap 2 elements at index 2 and 100 - out of range', function(){
    var sut = html.array([1,2,3,4,5,100,7,8]);
	ok(sut[2] === 3, 'Item at index 2 is 3');
	ok(sut[100] === undefined, 'Item at index 100 is undefined');
	sut.swap(2, 100);
	
    ok(sut[2] === 3, 'Item at index 2 is still 3, no swapping');
    ok(sut[100] === undefined, 'Item at index 100 is undefined');
});

test('Test method orderBy in html.array - sort by name ascendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 25}, {Name: 'Nhan', Age: 200},
						  {Name: 'John', Age: 12}, {Name: 'Johnson', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy('Name');
	deepEqual(sut[0], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 0");
	deepEqual(sut[1], {Name: 'Jack', Age: 12} , "{Name: 'Jack', Age: 12} is now at index 1");
	deepEqual(sut[2], {Name: 'John', Age: 12}, "{Name: 'John', Age: 12} is now at index 2");
	deepEqual(sut[3], {Name: 'Johnson', Age: 25}, "{Name: 'Johnson', Age: 25} is now at index 3");
	deepEqual(sut[4], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 4");
	deepEqual(sut[5], {Name: 'Nhan', Age: 200}, "{Name: 'Nhan', Age: 25} is now at index 5");
	deepEqual(sut[6], {Name: 'Peter', Age: 35}, "{Name: 'Peter', Age: 35} is now at index 6");
	deepEqual(sut[7], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 7");
});

test('Test method orderBy in html.array - sort by name descendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 25}, {Name: 'Nhan', Age: 200},
						  {Name: 'John', Age: 12}, {Name: 'Johnson', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy({field: 'Name', isAsc: false});
	deepEqual(sut[7], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 7");
	deepEqual(sut[6], {Name: 'Jack', Age: 12} , "{Name: 'Jack', Age: 12} is now at index 6");
	deepEqual(sut[5], {Name: 'John', Age: 12}, "{Name: 'John', Age: 12} is now at index 5");
	deepEqual(sut[4], {Name: 'Johnson', Age: 25}, "{Name: 'Johnson', Age: 25} is now at index 4");
	deepEqual(sut[3], {Name: 'Nhan', Age: 200}, "{Name: 'Nhan', Age: 25} is now at index 3");
	deepEqual(sut[2], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 2");
	deepEqual(sut[1], {Name: 'Peter', Age: 35}, "{Name: 'Peter', Age: 35} is now at index 1");
	deepEqual(sut[0], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 0");
});

test('Test method orderBy in html.array - sort by name ascendingly and then by age descendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 25}, {Name: 'Nhan', Age: 200},
						  {Name: 'John', Age: 12}, {Name: 'John', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy('Name', {field: 'Age', isAsc: false});
	deepEqual(sut[0], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 0");
	deepEqual(sut[1], {Name: 'Jack', Age: 12} , "{Name: 'Jack', Age: 12} is now at index 1");
	deepEqual(sut[2], {Name: 'John', Age: 25}, "{Name: 'John', Age: 25} is now at index 2");
	deepEqual(sut[3], {Name: 'John', Age: 12}, "{Name: 'John', Age: 12} is now at index 3");
	deepEqual(sut[4], {Name: 'Nhan', Age: 200}, "{Name: 'Nhan', Age: 200} is now at index 4");
	deepEqual(sut[5], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 5");
	deepEqual(sut[6], {Name: 'Peter', Age: 35}, "{Name: 'Peter', Age: 35} is now at index 6");
	deepEqual(sut[7], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 7");
});

test('Test method orderBy in html.array - sort by name descendingly and then by age descendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 25}, {Name: 'Nhan', Age: 200},
						  {Name: 'John', Age: 12}, {Name: 'John', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy({field: 'Name', isAsc: false}, {field: 'Age', isAsc: false});
	deepEqual(sut[0], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 0");
	deepEqual(sut[1], {Name: 'Peter', Age: 35} , "{Name: 'Peter', Age: 35} is now at index 1");
	deepEqual(sut[2], {Name: 'Nhan', Age: 200}, "{Name: 'Nhan', Age: 200} is now at index 2");
	deepEqual(sut[3], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 3");
	deepEqual(sut[4], {Name: 'John', Age: 25}, "{Name: 'John', Age: 25} is now at index 4");
	deepEqual(sut[5], {Name: 'John', Age: 12}, "{Name: 'John', Age: 12} is now at index 5");
	deepEqual(sut[6], {Name: 'Jack', Age: 12}, "{Name: 'Jack', Age: 12} is now at index 6");
	deepEqual(sut[7], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 7");
});

test('Test method orderBy in html.array - sort by age descendingly and then by age descendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 25}, {Name: 'Nhan', Age: 200},
						  {Name: 'John', Age: 12}, {Name: 'John', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy({field: 'Age', isAsc: false}, {field: 'Name', isAsc: false});
	deepEqual(sut[0], {Name: 'Nhan', Age: 200}, "{Name: 'Nhan', Age: 200} is now at index 0");
	deepEqual(sut[1], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 1");
	deepEqual(sut[2], {Name: 'Peter', Age: 35} , "{Name: 'Peter', Age: 35} is now at index 2");
	deepEqual(sut[3], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 4");
	deepEqual(sut[4], {Name: 'John', Age: 25}, "{Name: 'John', Age: 25} is now at index 5");
	deepEqual(sut[5], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 6");
	deepEqual(sut[6], {Name: 'John', Age: 12}, "{Name: 'John', Age: 12} is now at index 7");
	deepEqual(sut[7], {Name: 'Jack', Age: 12}, "{Name: 'Jack', Age: 12} is now at index 8");
});

test('Test method orderBy in html.array - sort by age ascendingly and then by age descendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 25}, {Name: 'Nhan', Age: 200},
						  {Name: 'John', Age: 12}, {Name: 'John', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy('Age', {field: 'Name', isAsc: false});
	deepEqual(sut[0], {Name: 'John', Age: 12}, "{Name: 'John', Age: 12} is now at index 0");
	deepEqual(sut[1], {Name: 'Jack', Age: 12}, "{Name: 'Jack', Age: 12} is now at index 1");
	deepEqual(sut[2], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 2");
	deepEqual(sut[3], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 3");
	deepEqual(sut[4], {Name: 'John', Age: 25}, "{Name: 'John', Age: 25} is now at index 4");
	deepEqual(sut[5], {Name: 'Peter', Age: 35} , "{Name: 'Peter', Age: 35} is now at index 5");
	deepEqual(sut[6], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 6");
	deepEqual(sut[7], {Name: 'Nhan', Age: 200}, "{Name: 'Nhan', Age: 200} is now at index 7");
});

test('Test method orderBy in html.array - sort by name descendingly and then by age ascendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 25}, {Name: 'Nhan', Age: 200},
						  {Name: 'John', Age: 12}, {Name: 'John', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy({field: 'Name', isAsc: false}, 'Age');
	deepEqual(sut[0], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 0");
	deepEqual(sut[1], {Name: 'Peter', Age: 35} , "{Name: 'Peter', Age: 35} is now at index 1");
	deepEqual(sut[2], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 2");
	deepEqual(sut[3], {Name: 'Nhan', Age: 200}, "{Name: 'Nhan', Age: 200} is now at index 3");
	deepEqual(sut[4], {Name: 'John', Age: 12}, "{Name: 'John', Age: 12} is now at index 5");
	deepEqual(sut[5], {Name: 'John', Age: 25}, "{Name: 'John', Age: 25} is now at index 6");
	deepEqual(sut[6], {Name: 'Jack', Age: 12}, "{Name: 'Jack', Age: 12} is now at index 4");
	deepEqual(sut[7], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 7");
});

test('Test method orderBy in html.array - sort by name ascendingly and then by age ascendingly', function(){
    var sut = html.array([{Name: 'Jack', Age: 12}, {Name: 'Andrew', Age: 21}, {Name: 'Nhan', Age: 210}, {Name: 'Nhan', Age: 25},
						  {Name: 'John', Age: 120}, {Name: 'John', Age: 25}, {Name: 'Peter', Age: 35}, {Name: 'Test', Age: 55}]);
						  
	sut.orderBy('Name', 'Age');
	deepEqual(sut[0], {Name: 'Andrew', Age: 21}, "{Name: 'Andrew', Age: 21} is now at index 0");
	deepEqual(sut[1], {Name: 'Jack', Age: 12}, "{Name: 'Jack', Age: 12} is now at index 1");
	deepEqual(sut[2], {Name: 'John', Age: 25}, "{Name: 'John', Age: 25} is now at index 2");
	deepEqual(sut[3], {Name: 'John', Age: 120}, "{Name: 'John', Age: 12} is now at index 3");
	deepEqual(sut[4], {Name: 'Nhan', Age: 25}, "{Name: 'Nhan', Age: 25} is now at index 4");
	deepEqual(sut[5], {Name: 'Nhan', Age: 210}, "{Name: 'Nhan', Age: 200} is now at index 5");
	deepEqual(sut[6], {Name: 'Peter', Age: 35} , "{Name: 'Peter', Age: 35} is now at index 6");
	deepEqual(sut[7], {Name: 'Test', Age: 55}, "{Name: 'Test', Age: 55} is now at index 7");
});