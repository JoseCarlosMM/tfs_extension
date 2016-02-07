 /// <reference path='../sdk/VSS' />

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");
import VSS_Service = require("VSS/Service");


var approvedPBI, committedPBI, donePBI, openImpediments;
var projectId;
var witClient;  
var container = $("#PBI");



VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"],  
    function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveApprovedPBI();
});

function retrieveApprovedPBI() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Approved') AND [System.WorkItemType] = 'Product Backlog Item' AND [System.IterationPath] = @CurrentIteration"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        approvedPBI = result.workItems.length;
        retrieveCommittedPBI();
    });
}

function retrieveCommittedPBI() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Committed') AND [System.WorkItemType] = 'Product Backlog Item' AND [System.IterationPath] = @CurrentIteration"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        committedPBI = result.workItems.length;
        retrieveDonePBI();
    });
}

function retrieveDonePBI() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Done') AND [System.WorkItemType] = 'Product Backlog Item' AND [System.IterationPath] = @CurrentIteration"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        donePBI = result.workItems.length;
        retrieveOpenImpediments();
    });
}

function retrieveOpenImpediments() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Open') AND [System.WorkItemType] = 'Impediment' AND [System.IterationPath] = @CurrentIteration"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        openImpediments = result.workItems.length;
        buildGrid();
    });
}

function buildGrid(): void {
    var options = {
        width: "100%",
        height: "80%",
        source: function () {
            var data = [];
            data.push(["Approved Product Backlog Items", approvedPBI]);
            data.push(["Committed Product Backlog Items", committedPBI]);
            data.push(["Product Backlog Items Done", donePBI]);
            data.push(["Open Impediments", openImpediments]);
            return data;
        }(),
        columns: [
            { text: "Id.", index: 0, width: 250 },
            { text: "No.", index: 1, width: 250 }
        ]
    };
    Controls.create<Grids.Grid, Grids.IGridOptions>(Grids.Grid, container, options);
    VSS.notifyLoadSucceeded();
}