//app init
var app = angular.module('PeiroShare', []);

//main app controller. manages active modules, profiles and notifies back-end of change in controls when necessary.
app.controller('PeiroShareController', ['$rootScope', '$scope',
	function(rootScope, scope) {
		var socket = io.connect();
		scope.text = "";
		scope.enabled = !document.queryCommandSupported('copy');
		scope.send = function() {
			if (scope.text != "") {
				socket.emit("newText", scope.text);
				scope.text = "";
			};
		};
		scope.copy = function(index) {
			//copied from https://developers.google.com/web/updates/2015/04/cut-and-copy-commands?hl=en 
			//by Matt Gaunt
			var copyText = document.getElementById('historyItem' + index);
			var range = document.createRange();
			range.selectNode(copyText);
			window.getSelection().addRange(range);
			try {
				document.execCommand('copy');
			} catch (err) {
				console.log('Error copying text');
			}
			window.getSelection().removeAllRanges();
		};
		scope.ifEnterSend = function(e) {
			if (e.keyCode == 13 && !e.shiftKey) {
				e.preventDefault();
				scope.send();
			}
		};
		scope.clear = function () {
			socket.emit("clearHistory");
		}
		socket.on("newHistory", function(data) {
			scope.historyTable = generateHistoryTable(data.reverse());
			scope.$apply();
		});

		function generateHistoryTable(history) {
			var historyTable = "<tr><th colspan=2>History</th><th><button data-ng-click='clear()'>Clear</button></th></tr>";
			for (var i = 0; i < history.length; i++) {
				//begin row and element
				historyTable = historyTable.concat("<tr><td>", i + 1, "</td><td id='historyItem" + i + "'>");
				//add item
				historyTable = historyTable.concat(history[i]);
				//end element
				historyTable = historyTable.concat("</td>");
				//add copy button
				historyTable = historyTable.concat("<td><button data-ng-click='copy(" + i + ")'>Copy</button></td>");
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