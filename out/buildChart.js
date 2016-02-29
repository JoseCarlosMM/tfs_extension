/// <reference path='../sdk/VSS' />
/// <reference path='../sdk/chart.ts' />
define(["require", "exports", "TFS/Build/RestClient", "TFS/TestManagement/RestClient"], function (require, exports, RestClient, TestClient) {
    var projectId;
    var buildClient, testClient;
    var container = $("#BuildStatus");
    var lastFiveBuilds = [];
    var canvas = document.getElementById('canvasChart');
    var ctx = canvas.getContext('2d');
    var ChartBuild = (function () {
        function ChartBuild() {
        }
        return ChartBuild;
    })();
    VSS.require(["VSS/Service", "TFS/Build/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        buildClient = RestClient.getClient();
        testClient = TestClient.getClient();
        retrieveBuilds();
    });
    function retrieveBuilds() {
        buildClient.getBuilds(projectId).then(function (result) {
            var lastBuild;
            for (var i = 0; i < 5; i++) {
                lastFiveBuilds.push(new ChartBuild());
            }
            for (var i = 4; i >= 0; i--) {
                var idMax = -1;
                for (var j = 0; j < result.length; j++) {
                    var build = result[j];
                    if (parseInt(build.id) > idMax) {
                        idMax = parseInt(build.id);
                        lastBuild = build;
                    }
                }
                lastFiveBuilds[i] = getChartBuild(lastBuild);
                lastBuild.id = -1;
            }
            var barData = {
                labels: [lastFiveBuilds[0].date, lastFiveBuilds[1].date, lastFiveBuilds[2].date, lastFiveBuilds[3].date, lastFiveBuilds[4].date],
                datasets: [
                    {
                        label: "Last Builds",
                        fillColor: "rgba(151,187,205,0.5)",
                        strokeColor: "rgba(151,187,205,0.8)",
                        highlightFill: "rgba(151,187,205,0.75)",
                        highlightStroke: "rgba(151,187,205,1)",
                        data: [lastFiveBuilds[0].compilationSeconds, lastFiveBuilds[1].compilationSeconds, lastFiveBuilds[2].compilationSeconds, lastFiveBuilds[3].compilationSeconds, lastFiveBuilds[4].compilationSeconds]
                    }
                ]
            };
            var buildsChart = new Chart(ctx).Bar(barData, {
                scaleBeginAtZero: true,
                scaleShowGridLines: true,
                scaleGridLineColor: "rgba(0,0,0,.05)",
                scaleGridLineWidth: 1,
                barShowStroke: true,
                barStrokeWidth: 2,
                scaleLabel: "          <%=value%> s",
                barValueSpacing: 4,
                barDatasetSpacing: 1,
                legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%> s </li><%}%></ul>"
            });
            VSS.notifyLoadSucceeded();
            //buildGrid();
        });
    }
    function getChartBuild(build) {
        var chartBuild = new ChartBuild();
        var startTime = build.startTime.getTime();
        var finishTime = build.finishTime.getTime();
        var miliseconds = finishTime - startTime;
        var seconds = Math.round(miliseconds / 1000);
        var chartBuild = new ChartBuild();
        chartBuild.compilationSeconds = seconds;
        chartBuild.date = formatDate(build.startTime);
        return chartBuild;
    }
    function formatDate(value) {
        var moth = value.getMonth() + 1;
        var year = value.getYear() + 1900;
        return moth + "/" + value.getDate() + "/" + year + " " + minTwoDigits(value.getHours()) + ":" + minTwoDigits(value.getMinutes());
    }
    function minTwoDigits(n) {
        return (n < 10 ? '0' : '') + n;
    }
});
