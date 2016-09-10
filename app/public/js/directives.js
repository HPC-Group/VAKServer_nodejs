/**
 * Created by my on 12.07.16.
 */

angular.module('VAK.directives', [])
    .directive('vakToDate', {
        restrict: 'EA',
        link: function link (scope, elem, attr) {
            'use strict';
       }
    })

    .directive('title', ['$rootScope', '$timeout', function($rootScope, $timeout) {
        'use strict';
        return {
            restrict: 'E',
            link: function() {
                var listener = function(event, toState) {
                    $timeout(function() {
                        $rootScope.title = (toState.data && toState.data.pageTitle)
                            ? toState.data.pageTitle
                            : 'Default title';
                    });
                };

                $rootScope.$on('$stateChangeSuccess', listener);
            }
        };
    }])

    .directive('vakLineGraph', [function () {
        'use strict';

        return {
            restrict: 'E',
            controllerAs: 'vakLineGraph',
            bindToController: true,
            controller: function () {},
            scope: {
              'seqData': '=vakData'
            },
            link: function (scope, elem, attr, ctrl) {
                var margin = { top: 30, right: 20, bottom: 180, left: 150 },
                    width = 800 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                // Set the ranges
                var x = d3.time.scale().range([0, width]);
                var y = d3.scale.ordinal().rangePoints([height, 0]);

                // Define the axes
                var xAxis = d3.svg.axis()
                    .scale(x).orient("bottom").ticks(10)
                    .innerTickSize(-height)
                    .outerTickSize(0)
                    .tickFormat(d3.time.format('%y-%m-%d %H:%M:%S.%L'))
                    .tickPadding(10);

                var yAxis = d3.svg.axis()
                    .scale(y).orient("left").ticks(10)
                    .innerTickSize(-width)
                    .outerTickSize(0)
                    .tickPadding(10);

                // Define the line
                var valueline = d3.svg.line()
                    .x(function(d) { return x(d.date); })
                    .y(function(d) { return y(d.tags[0]); });
                    //.interpolate('basis');

                // append svg
                var svg = d3.select('.svg__holder')
                    .append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                // Define the div for the tooltip
                var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                // Get the data
                angular.forEach(ctrl.seqData, function(data) {
                    // transform string to date so we can get an extent (min/max) value from all dates
                    data.date = moment(data.timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSSZ', true).toDate();

                    x.domain(d3.extent(ctrl.seqData, function(d) { return d.date; }));
                    y.domain(ctrl.seqData.map(function(d) { return d.tags[0]; }));
                });

                // Add the valueline path.
                /*svg.append("path")
                    .attr("class", "line")
                    .attr("d", valueline(ctrl.seqData))*/
                svg.selectAll(".dot")
                    .data(ctrl.seqData)
                    .enter().append("rect")
                    .attr("class", "dot")
                    .attr("width", 4)
                    .attr("height", 4)
                    .attr("x", function(d) { return x(d.date); })
                    .attr("y", function(d) { return y(d.tags[0]); })
                    .on("mouseover", function(d) {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);

                        tooltip.html(
                            '<ul class="list-unstyled">' +
                                '<li class="tooltip__date">' +
                                    '<span class="tooltip__label">Date</span> ' +
                                    '<span class="tooltip__value">'+ moment(d.date).format('YYYY-MM-DD HH:mm:ss.SSSZ') +'</span>' +
                                '</li>' +
                                '<li classs="tooltip__tags">' +
                                    '<span class="tooltip__label">Tags</span> ' +
                                    '<span class="tooltip__value">'+ d.tags.join(', ') +'</span>' +
                                '</li>' +
                                '<li classs="tooltip__comment">' +
                                    '<span class="tooltip__label">Comment</span> ' +
                                    '<span class="tooltip__value">'+ d.comment +'</span>' +
                                '</li>' +
                            '</ul>'
                            )
                            .style("left", (d3.event.pageX + 5) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                // add xAxis label
                svg.append('text')
                    .attr('x', width / 2)
                    .attr('y', (height + margin.top + margin.bottom) - 50)
                    .attr('class', 'axis__label')
                    .text('Date / Time');

                // Add the xAxis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll("text")
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", "rotate(-90)");

                // Add the yAxis label
                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .attr('class', 'axis__label')
                    .text("Tag");

                // Add the Y Axis
                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);
            }
        };
    }])
;
