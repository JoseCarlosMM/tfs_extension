/// <reference path='../sdk/VSS' />
define(["require", "exports", "VSS/Controls", "VSS/Controls/Grids", "TFS/Build/RestClient", "TFS/TestManagement/RestClient"], function (require, exports, Controls, Grids, RestClient, TestClient) {
    var buildStatus, buildResult, donePBI, openImpediments;
    var lastBuild, buildId, compilationTime, sourceBranch, codeCoverage, numLines;
    var projectId;
    var buildClient, testClient;
    var container = $("#Build");
    VSS.require(["VSS/Service", "TFS/Build/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        buildClient = RestClient.getClient();
        testClient = TestClient.getClient();
        retrieveBuilds();
    });
    function retrieveBuilds() {
        buildClient.getBuilds(projectId).then(function (result) {
            lastBuild = result[0];
            buildId = lastBuild.id;
            sourceBranch = lastBuild.sourceBranch;
            buildStatus = getStatus(lastBuild.status);
            buildResult = getResult(lastBuild.result);
            var startTime = lastBuild.startTime.getTime();
            var finishTime = lastBuild.finishTime.getTime();
            var miliseconds = finishTime - startTime;
            var seconds = Math.round(miliseconds / 1000);
            miliseconds = miliseconds - seconds * 1000;
            var cents = Math.round(miliseconds / 10);
            compilationTime = "";
            compilationTime = compilationTime.concat(seconds, ".", minTwoDigits(cents), " s");
            retrieveTestInfo();
        });
    }
    function retrieveTestInfo() {
        testClient.getBuildCodeCoverage(projectId, buildId).then(function (result) {
            buildGrid();
        });
    }
    function getStatus(status) {
        switch (status) {
            case 0:
                return 'None';
            case 1:
                return "In progress";
            case 2:
                return 'Completed';
            case 4:
                return "Cancelling";
            case 8:
                return "Postponed";
            case 32:
                return "NotStarted";
            default: "Unknown";
        }
    }
    function getResult(result) {
        switch (result) {
            case 0:
                return "None";
            case 2:
                return "Succeeded";
            case 4:
                return "PartiallySucceeded";
            case 8:
                return "Failed";
            case 32:
                return "Canceled";
            default: "Unknown";
        }
    }
    function minTwoDigits(n) {
        return (n < 10 ? '0' : '') + n;
    }
    function buildGrid() {
        var options = {
            width: "100%",
            height: "80%",
            source: function () {
                var data = [];
                data.push(["Build Status", buildStatus]);
                data.push(["Build Result", buildResult]);
                data.push(["Source Branch", sourceBranch]);
                data.push(["Compilation Time", compilationTime]);
                data.push(["Code Coverage", codeCoverage]);
                data.push(["Num Lines", numLines]);
                return data;
            }(),
            columns: [
                { text: "Id.", index: 0, width: 250 },
                { text: "No.", index: 1, width: 250 }
            ]
        };
        Controls.create(Grids.Grid, container, options);
        VSS.notifyLoadSucceeded();
    }
});
