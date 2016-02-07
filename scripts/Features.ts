 /// <reference path='../sdk/VSS' />

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");
import VSS_Service = require("VSS/Service");


var ResolvedFeatures, NewFeatures, ClosedFeatures,ActiveFeatures;
var projectId;
var witClient;
var container = $("#Features");



VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"],  
    function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveActive();
});

function retrieveActive() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Active') AND [System.WorkItemType] = 'Feature'"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        ActiveFeatures = result.workItems.length;
        retrieveNew();
    });
}

function retrieveNew() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('New') AND [System.WorkItemType] = 'Feature'"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        NewFeatures = result.workItems.length;
        retrieveClosed();
    });
}

function retrieveClosed() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Closed') AND [System.WorkItemType] = 'Feature'"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        ClosedFeatures = result.workItems.length;
        retrieveResolved();
    });
}

function retrieveResolved() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Resolved') AND [System.WorkItemType] = 'Feature'"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        ResolvedFeatures = result.workItems.length;
        buildGrid();
    });
}

function buildGrid(): void {
    var options = {
        width: "100%",
        height: "80%",
        source: function () {
            var data = [];
            data.push(["New Features", NewFeatures]);
            data.push(["Active Features", ActiveFeatures]);
            data.push(["Resolved Features", ResolvedFeatures]);
            data.push(["Closed Features", ClosedFeatures]);
            
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




