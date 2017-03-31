/*MIT License

Copyright (c) 2017 ck24

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
    module.exports = 'bta-highcharts';
}

(function() {
    'use strict';

    var highcharts;

    if (window && window.Highcharts) {
        highcharts = window.Highcharts;
    } else if (module && module.exports === 'bta-highcharts') {
        highcharts = require('highcharts');
    }

    angular
        .module('bta-highcharts', [])
        .component('btaHighchart',
        {
            bindings: {
                panelId: '<',
                config: '<',
                chartOnInit: '&'
            },
            controllerAs: 'vm',
            controller: ['$element', '$timeout', btaHighchartController]
        });

    function btaHighchartController($element, $timeout) {
        /*jshint validthis: true */
        var vm = this;
        vm.axisId = 0;
        vm.seriesId = 0;
        vm.plotLineId = 0;

        vm.$onInit = function () {
            vm.panelId = vm.panelId || 0;
            var mergedConfig = getMergedConfig($element, vm.config);
            vm.chart = new highcharts.Chart(mergedConfig);
            vm.api = getApi();
            vm.chartOnInit({ $API: vm.api });
        };

        this.$onDestroy = function() {
            if (vm.chart) {
                try {
                    vm.chart.destroy();
                } catch (ex) {
                    // fail silently as highcharts will throw exception if element doesn't exist
                }

                $timeout(function() {
                    $element.remove();
                }, 0);
            }
        };

        ////////

        function getMergedConfig(element, config) {
            var mergedConfig,
                defaultConfig = {
                    chart: {
                        events: {}
                    },
                    title: {},
                    subtitle: {},
                    series: [],
                    loading: false,
                    credits: {
                        enabled: false
                    },
                    plotOptions: {},
                    navigator: {}
                };

            if (config) {
                mergedConfig = angular.merge(defaultConfig, config);
            } else {
                mergedConfig = defaultConfig;
            }
            mergedConfig.chart.renderTo = element[0];
            return mergedConfig;
        }

        function getApi() {
            var api = {};
            api.setTitle = setTitle;
            api.redraw = redraw;
            api.reflow = reflow;
            api.updateChart = updateChart;
            api.addSeries = addSeries;
            api.updateSeries = updateSeries;
            api.removeSeries = removeSeries;
            api.clearSeries = clearSeries;
            api.setSeriesData = setSeriesData;
            api.addAxis = addAxis;
            api.updateAxis = updateAxis;
            api.removeAxis = removeAxis;
            api.clearAxes = clearAxes;
            api.updateXAxis = updateXAxis;
            api.addPlotLine = addPlotLine;
            api.removePlotLine = removePlotLine,
            api.hasSeries = hasSeries,
            api.hasPlotLines = hasPlotLines,
            api.hideTooltip = hideTooltip;
            api.hideCrosshair = hideCrosshair;
            return api;
        }

        /**
         * Set the title to the specified text.
         * @param {} titleText Text to display as title. 
         * @returns {} 
         */
        function setTitle(titleText) {
            vm.chart.setTitle({ text: titleText });
        }

        /**
         * Redraws this chart.
         * @returns {} 
         */
        function redraw() {
            vm.chart.redraw();
        }

        /**
         * Reflows this chart.
         * @returns {} 
         */
        function reflow() {
            vm.chart.reflow();
        }

        /**
         * Updates the chart with the specified config.
         * @param {} config 
         * @returns {} 
         */
        function updateChart(config) {
            vm.chart.update(config, false);
        }

        /**
         * Add the specified series to the collection of series.
         * @param {} series Series to add.
         * @returns the added series. 
         */
        function addSeries(series) {
            if (!series) {
                return undefined;
            }
            vm.seriesId += 1;
            series.xAxis = 0;
            series.id = 'series_'.concat(vm.panelId, '_', vm.seriesId);
            vm.chart.addSeries(series, false);
            return series;
        }

        /**
        * Updates the series with the specified id with the specified config object.
        * @param {} config - Configuration to use for update.
        * @returns whether series has been updated. 
        */
        function updateSeries(seriesId, config) {
            if (!seriesId) {
                return false;
            }
            var series = vm.chart.get(seriesId);
            if (!series) {
                return false;
            }
            series.update(config, false);
            return true;
        }

        /**
         * Applies a new set of data to the series with the specified id.
         * @param {number} seriesId - Id of series to update data for.
         * @param {Array<>} data - Array of data.
         * @param {boolean} redraw - Indicates whether series shall be redrawn (Defaults to false) . 
         * @returns whether the data has been updated. 
         */
        function setSeriesData(seriesId, data, redraw) {
            if (!seriesId) {
                return false;
            }
            var series = vm.chart.get(seriesId);
            if (!series) {
                return false;
            }
            redraw = getValueOrDefault(redraw, false);
            series.setData(data, redraw, false, true);
            return true;
        }

        /**
         * Removed the series with the specified id.
         * @param {number} seriesId Id of series to remove.
         * @returns whether series has been removed.
         */
        function removeSeries(seriesId) {
            if (!seriesId || !vm.chart.series) {
                return false;
            }
            var series = vm.chart.get(seriesId);
            if (!series) {
                return false;
            }
            series.remove(false);
            return true;
        }

        /**
         * Removes all series from this chart.
         * @returns {} 
         */
        function clearSeries() {
            if (!vm.chart.series) {
                return;
            }
            for (var i = vm.chart.series.length - 1; i >= 0; i -= 1) {
                vm.chart.series[i].remove(false);
            }
        }

        /**
         * Adds the specified axis to the collection of axes of this chart.
         * @param {} axis - Axis to add to axes collection.
         * @returns the added axis.
         */
        function addAxis(axis) {
            if (!axis) {
                return undefined;
            }
            vm.axisId += 1;
            axis.id = 'axis_'.concat(vm.panelId, '_', vm.axisId);
            vm.chart.addAxis(axis, false, false);
            return axis;
        }

        /**
        * Updates the axis with the specified id with the specified config object.
        * @param {} config - Configuration to use for update.
        * @returns whether axis has been updated. 
        */
        function updateAxis(axisId, config) {
            if (!axisId) {
                return false;
            }
            var axis = vm.chart.get(axisId);
            if (!axis) {
                return false;
            }
            axis.update(config, false);
            return true;
        }

        /**
         * Removes the axis with the specified id.
         * @param {} axisId - Id of axis to remove.
         * @returns whether the axis has been removed. 
         */
        function removeAxis(axisId) {
            if (!axisId) {
                return false;
            }
            var axis = vm.chart.get(axisId);
            if (!axis) {
                return false;
            }
            axis.remove(false);
            return true;
        }

        /**
         * Removes all y-axes from the chart.
         * @returns {} 
         */
        function clearAxes() {
            if (!vm.chart.yAxis) {
                return;
            }
            for (var i = vm.chart.yAxis.length - 1; i >= 0; i -= 1) {
                vm.chart.yAxis[i].remove(false);
            }
        }

        /**
         * Add the specified plot-line to the x-axis of this chart.
         * @param {} plotLine Plot-line to add.
         * @returns the added plot-line.
         */
        function addPlotLine(plotLine) {
            if (!plotLine || !hasXAxis()) {
                return undefined;
            }
            vm.plotLineId += 1;
            plotLine.id = 'plotLine_'.concat(vm.panelId, '_', vm.plotLineId);
            vm.chart.xAxis[0].addPlotLine(plotLine);
            return plotLine;
        }

        /**
         * Removes the plot-line with the specified id from the chart.
         * @param {number} plotLineId - Id of plot-line to remove.
         * @returns whether the plotLine has been removed. 
         */
        function removePlotLine(plotLineId) {
            if (!plotLineId || !hasXAxis()) {
                return false;
            }
            vm.chart.xAxis[0].removePlotLine(plotLineId);
            return true;
        }

        function hasSeries() {
            return vm.chart && vm.chart.series && vm.chart.series.length > 0;
        }

        function hasPlotLines() {
            return vm.chart && vm.chart.xAxis && vm.chart.xAxis.plotLines && vm.chart.xAxis.plotLines.length > 0;
        }

        /**
         * Updates the x-axis of this chart with the specified config.
         * @param {} config - Configuration object of x-axis.
         * @returns the updated xAxis
         */
        function updateXAxis(config) {
            if (!config || !hasXAxis()) {
                return undefined;
            }
            vm.chart.xAxis[0].update(config, false);
            return vm.chart.xAxis[0];
        }

        /**
         * Hides the tooltip for this chart.
         * @returns whether the tooltip has been hidden successfully.
         */
        function hideTooltip() {
            if (!vm.chart.tooltip) {
                return false;
            }
            vm.chart.tooltip.hide(1000);
            return true;
        }

        /**
         * Hides the crosshair for this chart.
         * @returns whether the crosshair has been hidden successfully.
         */
        function hideCrosshair() {
            if (hasXAxis()) {
                vm.chart.xAxis[0].hideCrosshair();
            }
        }

        //// private functions

        /**
         * Checks whether this chart has an x-axis.
         * @returns true if chart has an x-axis, otherwise false. 
         */
        function hasXAxis() {
            return vm.chart && vm.chart.xAxis && vm.chart.xAxis.length > 0;
        }

        /**
         * Gets the specified value, if it is set or the specified defaultvalue if it is not.
         * @param {} value - Valu 
         * @param {} defaultValue - Default value to use if value is not set. 
         * @returns the specified value or the defaultvalue if the value is not set.
         */
        function getValueOrDefault(value, defaultValue) {
            return value !== undefined && value !== null ? value : defaultValue;
        }
    }
})();
