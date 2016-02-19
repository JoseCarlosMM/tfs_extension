 /// <reference path='../sdk/VSS' />

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");
import VSS_Service = require("VSS/Service");


var ResolvedFeatures, NewFeatures, ClosedFeatures,ActiveFeatures;
var projectId;
var witClient;
var container = $("#FeaturesGrid");



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

      // Generate an array of all open work item ID's
                var openWorkItems = result.workItems.map(function (wi) { return wi.id });

                var fields = [
                    "System.Title", 
                    "System.State", 
                    "Microsoft.VSTS.Common.StateChangeDate", 
                    "System.AssignedTo"];

                witClient.getWorkItems(openWorkItems, fields).then(
                        function (workItems) {
                            // Access the work items and their field values
                            var options = {
        width: "100%",
        height: "80%",
        source: workItems.map(function (w) {
                return [
                    w.id, 
                    w.fields["System.Title"]];
            }),
            columns: [
                { text: " ", index: 1, width: 200 }
            ]
        };
    Controls.create<Grids.Grid, Grids.IGridOptions>(Grids.Grid, container, options);
    VSS.notifyLoadSucceeded();
                          //  VSS.notifyLoadSucceeded();
                        });


         buildGrid();
    });
}

function buildGrid(): void {
    
}




