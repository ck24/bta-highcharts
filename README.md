# bta-highcharts
AngularJS wrapper for Highcharts

## Requirements
 
AngularJS >= 1.6.0, and Highcharts >= 5.0.0 

## Getting started

1. Add the file bta-highcharts.js to your scripts.
2. Add the module bta-highcharts as a dependency to your app like this:
     ```javascript 
        angular
        .module('yourApp', [
        // other dependencies
        'bta-highcharts']);
     ```
3. Use it in your template like this:
    ```html
      <bta-highchart config="chartConfig" chart-on-init="chartApi=$API" panel-id="1"></bta-highchart>
    ```
 
##  Properties

- **config** -  Chart configuration, all highcharts options are possible
- **panel-id** - Id of an optional panel (defaults to 1; useful if you have more than one chart on a page)
- **chart-on-init** - When the chart-wrapper is initialized it exposes an API and the chartOnInit-method gets called. 
  Save the exposed variable $API into a variable of your component in order to be able to 
  change the chart configuration at runtime. 
  The API is a reduced version of the Highcharts-API.
