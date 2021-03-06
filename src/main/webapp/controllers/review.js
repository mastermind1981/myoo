angular.module('myooApp').controller(
		'reviewCtrl',
		[
				'$scope',
				'$filter',
				'$http',
				'FN_AJAX_FAILURE',
				'TODAY',
				'LAST_WEEK',
				'LAST_MONTH',
				'DATE_REGEX',
				function($scope, $filter, $http, FN_AJAX_FAILURE, TODAY, LAST_WEEK, LAST_MONTH, DATE_REGEX) {
					var dateFilter = $filter('date');
					var getComparisonData = function(comparison) {
						var arr = [], header = [ 'Date' ], dateBuf;
						for ( var user in comparison.users) {
							header.push(user);
						}
						arr.push(header);
						for (var i = 0, len = comparison.dates.length; i < len; i++) {
							dateBuf = [ dateFilter(comparison.dates[i]) ];
							for (user in comparison.users) {
								dateBuf.push(comparison.users[user][i]);
							}
							arr.push(dateBuf)
						}
						return google.visualization.arrayToDataTable(arr);
					};
					var getAchievementsData = function(achievements) {
						var arr = [], header = [ 'Achievement', $scope.currentUserNickname ];
						arr.push(header);
						if (achievements) {
							for ( var achievement in achievements) {
								arr.push([ achievement, achievements[achievement] ]);
							}
						} else {
							arr.push([]);
						}
						return google.visualization.arrayToDataTable(arr);
					};
					var getChartData = function(data) {
						var ret = null;
						for ( var chart in data) {
							switch (chart) {
							case 'comparison': {
								ret = getComparisonData(data.comparison);
								break;
							}
							case 'achievements': {
								ret = getAchievementsData(data.achievements);
								break;
							}
							default: {
								ret = [];
								break;
							}
							}
						}
						return ret;
					};
					$scope.changeReviewSelection = function(selection) {
						$scope.userState.review.currentSelection = selection;
					};
					$scope.set1Day = function() {
						$scope.userState.review.to = dateFilter(TODAY, 'yyyy-MM-dd')
						$scope.userState.review.from = dateFilter(TODAY, 'yyyy-MM-dd');
					};
					$scope.set1Week = function() {
						$scope.userState.review.to = dateFilter(TODAY, 'yyyy-MM-dd');
						$scope.userState.review.from = dateFilter(LAST_WEEK, 'yyyy-MM-dd');
					};
					$scope.set1Month = function() {
						$scope.userState.review.to = dateFilter(TODAY, 'yyyy-MM-dd');
						$scope.userState.review.from = dateFilter(LAST_MONTH, 'yyyy-MM-dd');
					};
					$scope.$watch('userState.review', function(newValue, oldValue) {
						if (angular.isString(newValue.from) && newValue.from.match(DATE_REGEX) && angular.isString(newValue.to)
								&& newValue.to.match(DATE_REGEX)) {
							$http.get('api/projects/' + $scope.userState.currentProjectId + '/review/' + newValue.currentSelection.id, {
								params : {
									from : newValue.from,
									to : newValue.to
								}
							}).then(function(response) {
								$scope.userState.chartData = getChartData(response.data);
							}, FN_AJAX_FAILURE);
						} else {
							// do nothing
						}
					}, true);
					$scope.$on('clearPointsSuccess', function onClearPointsSuccess() {
						$scope.userState.review.refresh = !$scope.userState.review.refresh;
					});
				} ]);