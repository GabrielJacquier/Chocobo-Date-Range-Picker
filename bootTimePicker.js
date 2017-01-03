(function (angular) {
  'use strict';
  angular.module('BotPicker', [])
    .directive("bootpicker", ['$filter', function ($filter) {

      String.prototype.capitalizeFirstLetter = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
      };

      Date.prototype.reverseFormat = function (tDate, format) {
        if (format === 'dd/MM/yyyy') {
          var formatDate = tDate.split("/");
          return new Date(formatDate[2], formatDate[1] - 1, formatDate[0]);
        }
        return new Date(tDate);
        //year//month//day -> this is used when the format was dd/MM/yyyy
      };

      return {
        require: 'ngModel',
        restrict: "AE",
        scope: {
          locale: '@',
          options: '='
        },
        link: function (scope, elem, attrs, ngModel) {

          var date = new Date();//$filter('date')(new Date(), 'dd/MM/yyyy');
          var optionsWeek = { weekday: "long" };
          var optionsMonth = { month: 'long' };
          var optionsYear = { year: 'numeric' };
          var optionsDay = { day: 'numeric' };
          var optionsAlmostComplete = { day: '2-digit', month: '2-digit', year: 'numeric' };

          //attr format that it was arrived form directive
          scope.startDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
          scope.endDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
          scope.dateMap = {};

          function getFirstDayOfWeek() {
            var dt = new Date();
            var day = dt.getDay();
            dt.setDate((dt.getDate() - day + (day === 0 ? -6 : 0)));
            return dt.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter();
          }

          var getLastSunday = function (d) {
            var t = new Date(d);
            t.setDate(t.getDate() - t.getDay());
            return t;
          };

          var getRangeDate = function (currentDate, endDate) {
            var tempArray = [];
            endDate = new Date(endDate);
            currentDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            while (currentDate <= endDate) {
              tempArray.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
            return tempArray;
          };



          var changeDate = function (tDate, isInital) {
            var month = tDate.toLocaleDateString(attrs.locale, optionsMonth).capitalizeFirstLetter();
            var year = tDate.toLocaleDateString(attrs.locale, optionsYear).capitalizeFirstLetter();

            if (isInital) {
              scope.dateInitialMap = { month: month, year: year, result: setRangeDay(tDate) };
              if (!scope.dateFinalMap) {
                scope.dateFinalMap = { month: month, year: year, result: setRangeDay(tDate) };
              }
            }
            else {
              scope.dateFinalMap = { month: month, year: year, result: setRangeDay(tDate) };
            }

            function setRangeDay(tDate) {

              var start = new Date(tDate.getFullYear(), tDate.getMonth(), 1);
              var end = new Date(tDate.getFullYear(), tDate.getMonth() + 1, 0);
              var weeks = [];
              var tDay = getLastSunday(new Date());
              for (var index = start.getDate(); index <= end.getDate(); index++) {
                start.setDate(index);
                if (start.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter() == getLastSunday(new Date()).toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter() || weeks.length === 0) {
                  var week = {};
                  if (index === 1) {

                    for (var cont = 0; cont < 7; cont++) {
                      var dt = tDay;
                      week[getWeekDays(dt)[cont]] = {};
                      dt.setDate(dt.getDate() + cont);
                    }
                  }
                  weeks.push(week);
                }

                weeks[weeks.length - 1][start.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter()] = { date: new Date(start), class: 'padrao' };
                if (index === 1 && start.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter() !== getLastSunday(start).toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter()) {
                  weeks.find(findLast);
                }

                if (index == getLastDayOfMonth(tDate) && start.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter() !== getNextSaturday()) {
                  weeks.find(findNext);
                }
              }
              return weeks;
            }
          };

          function getNextSaturday() {
            var now = new Date();
            now.setDate(now.getDate() + (6 + (7 - now.getDay())) % 7);
            return now.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter();
          }

          function getDaySaturday(now) {
            now.setDate(now.getDate() + (7 + (7 - now.getDay())) % 7);
            return now.toLocaleDateString(attrs.locale, optionsDay);
          }

          function findNext(element, index, array) {
            if (array.length === index + 1) {
              var dt = new Date(date);
              dt.setDate(getLastDayOfMonth(dt));
              setNextDaysOfNextMonth(element, dt);
            }
          }

          function findLast(element, index, array) {
            var FIRST_WEEK = 0;
            if (index === FIRST_WEEK) {
              var td = date;
              setLastDaysOfLastMonth(element, td);
            }
          }

          function getLastDayOfWeek(day) {
            var now = new Date();
            now.setDate(now.getDate() + (day + (7 - now.getDay())) % 7);
            return now.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter();
          }

          function getNextWeekLastDay(now) {
            var dt = new Date(now);
            dt.setDate(dt.getDate() + (7 + 6 - dt.getDay()) % 7);
            return dt;
          }

          function setNextDaysOfNextMonth(element, dt) {
            var nextSadurday = getNextWeekLastDay(dt);
            var lastDay = dt;
            lastDay.setHours(0, 0, 0, 0);
            nextSadurday.setHours(0, 0, 0, 0);
            lastDay.setDate(lastDay.getDate() + 1);
            while (lastDay <= nextSadurday) {
              var tempDate = lastDay;
              element[new Date(tempDate).toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter()] = { date: new Date(lastDay), class: 'proximo' };
              lastDay.setDate(lastDay.getDate() + 1);
            }
          }

          function setLastDaysOfLastMonth(element, dt) {
            dt.setDate(1);
            if (getLastDayOfWeek(7) != dt.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter()) {
              var lastSunday = getLastSunday(dt);
              var lastDayOfMonth = new Date(lastSunday.getUTCFullYear(), lastSunday.getUTCMonth() + 1, 0);
              lastSunday.setHours(0, 0, 0, 0);
              lastDayOfMonth.setHours(0, 0, 0, 0);
              while (lastSunday <= lastDayOfMonth) {
                var tempDate = lastSunday;
                element[new Date(tempDate).toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter()] = { date: new Date(lastSunday), class: 'ultimo' };
                lastSunday.setDate(lastSunday.getDate() + 1);
              }
            }
          }

          changeDate(date, true);

          function getWeekDays() {
            var dt = new Date();
            dt = new Date(dt.getFullYear(), dt.getMonth(), getDaySaturday(dt));
            var weekList = [];
            var tDay = parseInt(getDaySaturday(dt));
            for (var index = 0; index < 7; index++) {
              var day = (tDay + index);
              var dtTemp = new Date(dt.getFullYear(), dt.getMonth(), day);
              weekList.push(dtTemp.toLocaleDateString(attrs.locale, optionsWeek).capitalizeFirstLetter());
            }
            return weekList;
          }

          function getFormatDate(tDate, format) {
            return $filter('date')(tDate, format);
          }

          function getLastDayOfMonth(tDate) {
            var dt = new Date(tDate.getUTCFullYear(), tDate.getUTCMonth() + 1, 0);
            return dt.toLocaleDateString(attrs.locale, optionsDay);
          }

          function setRangeDate() {
            var currentDate = new Date(scope.startDate);
            between = getRangeDate(currentDate, scope.endDate).splice(0);
            ngModel.$setViewValue(between);
            ngModel.$render();
            console.log('quantity ', between.length);
          }

          scope.chooseInitalDay = function (dt) {
            date = dt.date;
            scope.startDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
            changeDate(dt.date, true);
          };

          scope.chooseFinalDay = function (dt) {
            date = dt.date;
            scope.endDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
            changeDate(dt.date);
          };

          scope.allWeeks = getWeekDays(new Date());

          scope.nextInitialMonth = function (isInital) {
            var DECEMBER = 11;
            if (date.getMonth() == DECEMBER) {
              date = new Date(date.getFullYear() + 1, 0, 1);
            } else {
              date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            }
            if (isInital) {
              scope.startDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
              changeDate(date, true);
            }
            else {
              scope.endDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
              changeDate(date);
            }
          };

          scope.lastInitialMonth = function (isInital) {
            var JANUARY = 0;
            if (date.getMonth() === JANUARY) {
              date = new Date(date.getFullYear() - 1, 11, 1);
            } else {
              date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
            }
            if (isInital) {
              scope.startDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
              changeDate(date, true);
            }
            else {
              scope.endDate = date.toLocaleDateString(attrs.locale, optionsAlmostComplete);
              changeDate(date);
            }
          };


          var between = [];
          between.push(getFormatDate(new Date()));
          ngModel.$setViewValue(between);

          angular.element(elem).on('change', function (event) {
            between = [];
            setRangeDate();
          });

          scope.selectYear = function () {
            var today = new Date();
            today.setMonth(today.getMonth() - 12);
            scope.startDate = today;
            scope.endDate = new Date();
            between = [];
            setRangeDate();
          };

          scope.selectSemester = function () {
            var today = new Date();
            today.setMonth(today.getMonth() - 6);
            scope.startDate = today;
            scope.endDate = new Date();
            between = [];
            setRangeDate();
          };

          scope.selectTrimester = function () {
            var today = new Date();
            today.setMonth(today.getMonth() - 3);
            scope.startDate = today;
            scope.endDate = new Date();
            between = [];
            setRangeDate();
          };

          scope.selectMonth = function () {
            var today = new Date();
            today.setMonth(today.getMonth() - 1);
            scope.startDate = today;
            scope.endDate = new Date();
            between = [];
            setRangeDate();
          };

          scope.selectWeek = function () {
            var today = new Date();
            today.setDate(today.getDate() - 7);
            scope.startDate = today;
            scope.endDate = new Date();
            between = [];
            setRangeDate();
          };

          scope.selectLastDay = function () {
            var today = new Date();
            today.setDate(today.getDate() - 1);
            scope.startDate = today;
            scope.endDate = today;
            between = [];
            setRangeDate();
          };

          scope.selectToday = function () {
            scope.startDate = new Date();
            scope.endDate = new Date();
            between = [];
            setRangeDate();
          };

        },
        templateUrl: '/timePicker.html'
      };
    }]);
})(angular);
