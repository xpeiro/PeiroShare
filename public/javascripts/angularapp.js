//app init
var app = angular.module('PeiroShare', []);

//main app controller. manages active modules, profiles and notifies back-end of change in controls when necessary.
app.controller('PeiroShareController', ['$rootScope', '$scope',
	function(rootScope, scope) {
		var socket = io.connect({
			secure: true
		});
		scope.text = "";
		scope.send = function() {
			socket.emit("newText", scope.text);
		};
		scope.copy = function(e, index) {
			console.log(index);
			var clip = new ClipboardEvent('copy');
			clip.clipboardData.setData('text/plain', "testeo");
		};
		socket.on("newHistory", function(data) {
			console.log(data);
			scope.historyTable = generateHistoryTable(data.reverse());
			scope.$apply();
		});


		function generateHistoryTable(history) {
			var historyTable = "<tr><th colspan=3>History</th></tr>";
			for (var i = 0; i < history.length; i++) {
				//begin row and element
				historyTable = historyTable.concat("<tr><td>", i + 1, "</td><td>");
				//add item
				historyTable = historyTable.concat(history[i]);
				//end element
				historyTable = historyTable.concat("</td>");
				//add copy button
				historyTable = historyTable.concat("<td><button data-ng-click='copy($event," + i + ")''>Copy</button></td>");
				//end row
				historyTable = historyTable.concat("</tr>");
			};
			return historyTable;
		};
	},
]);

app.directive('compile', function($compile) {
	return function(scope, element, attrs) {
		scope.$watch(
			function(scope) {
				// watch the 'compile' expression for changes
				return scope.$eval(attrs.compile);
			},
			function(value) {
				// when the 'compile' expression changes
				// assign it into the current DOM
				element.html(value);

				// compile the new DOM and link it to the current
				// scope.
				$compile(element.contents())(scope);
			}
		);
	};
});