 /// <reference path='../sdk/VSS' />

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");
import VSS_Service = require("VSS/Service");


var approvedBugs, committedBugs, bugsDone;
var projectId;
var witClient;
var container = $("#Quality");



VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"],  
    function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveApprovedBugs();
});

function retrieveApprovedBugs() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Approved') AND [System.WorkItemType] = 'Bug'  AND [System.IterationPath] = @CurrentIteration"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        approvedBugs = result.workItems.length;
        retrieveCommittedBugs();
    });
}

function retrieveCommittedBugs() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Committed') AND [System.WorkItemType] = 'Bug'  AND [System.IterationPath] = @CurrentIteration"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        committedBugs = result.workItems.length;
        retrieveBugsDone();
    });
}

function retrieveBugsDone() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Done') AND [System.WorkItemType] = 'Bug'  AND [System.IterationPath] = @CurrentIteration"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        bugsDone = result.workItems.length;
        buildGrid();
    });
}

function buildGrid(): void {
    var options = {
        width: "100%",
        height: "80%",
        source: function () {
            var data = [];
            data.push(["Approved Bugs", approvedBugs]);
            data.push(["Committed Bugs", committedBugs]);
            data.push(["Bugs Done", bugsDone]);
            data.push(["Sprint Test Cases", bugsDone]);
            data.push(["Total Test Cases Created", bugsDone]);
            data.push(["Total Test Cases Automated", bugsDone]);
            return data;
        }(),
        columns: [
            { text: "Id.", index: 0, width: 100 },
            { text: "No.", index: 1, width: 100 }
        ]
    };
    Controls.create<Grids.Grid, Grids.IGridOptions>(Grids.Grid, container, options);
    VSS.notifyLoadSucceeded();
}




