/// <reference path='../sdk/VSS' />

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import VSS_Service = require("VSS/Service");
import RestClient = require("TFS/Build/RestClient");
import TestClient = require("TFS/TestManagement/RestClient");

var buildStatus, buildResult, donePBI, openImpediments;
var lastBuild, buildId, compilationTime, sourceBranch, codeCoverage, numLines;
var projectId;
var buildClient, testClient;  
var container = $("#Build");



VSS.require(["VSS/Service", "TFS/Build/RestClient"],  
    function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        buildClient =  RestClient.getClient();
        testClient = TestClient.getClient();
        retrieveBuilds();
});

function retrieveBuilds() : void {
    buildClient.getBuilds (projectId).then(function (result) {
        var idMax=-1;
        //Getting the last build
        for (var i = 0; i < result.length; i++) {
            var build=result[i];
            if(parseInt(build.id)>idMax)
            {
                idMax=parseInt(build.id);
                lastBuild=build;
            }
        }
        buildId=lastBuild.id;
        sourceBranch=lastBuild.sourceBranch;
        buildStatus=getStatus(lastBuild.status);
        buildResult=getResult(lastBuild.result);
        var startTime=lastBuild.startTime.getTime();
        var finishTime=lastBuild.finishTime.getTime();
        var miliseconds=finishTime-startTime;
        var seconds=Math.round(miliseconds/1000);
        miliseconds=miliseconds-seconds*1000;
        var cents =Math.round(miliseconds/10);
        compilationTime="";
        compilationTime= compilationTime.concat(seconds,".",minTwoDigits(cents)," s");
        retrieveTestInfo();
    });
}

function retrieveTestInfo() : void {
    testClient.getBuildCodeCoverage(projectId, buildId).then(function (result) {
        buildGrid();
    });
}


function getStatus(status){
    switch (status)
    {
        case 0 :
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
        default :"Unknown";
    }
}

function getResult(result){
    switch (result)
    {
        case 0 :
            return "None";
        case 2:
            return "Succeeded";
        case 4:
            return "PartiallySucceeded";
        case 8:
            return "Failed";
        case 32:
            return "Canceled";
        default :"Unknown";
    }
}

function minTwoDigits(n) {
  return (n < 10 ? '0' : '') + n;
}

function buildGrid(): void {
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
            { text: " ", index: 0, width: 150 },
            { text: " ", index: 1, width: 200 }
        ]
    };
    Controls.create<Grids.Grid, Grids.IGridOptions>(Grids.Grid, container, options);
    VSS.notifyLoadSucceeded();
}