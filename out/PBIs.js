/// <reference path='../sdk/VSS' />
define(["require", "exports", "VSS/Controls", "VSS/Controls/Grids"], function (require, exports, Controls, Grids) {
    var approvedPBI, committedPBI, donePBI, openImpediments;
    var projectId;
    var witClient;
    var container = $("#PBI");
    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveApprovedPBI();
    });
    function retrieveApprovedPBI() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Approved') AND [System.WorkItemType] = 'Product Backlog Item' AND [System.IterationPath] = @CurrentIteration" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            approvedPBI = result.workItems.length;
            retrieveCommittedPBI();
        });
    }
    function retrieveCommittedPBI() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Committed') AND [System.WorkItemType] = 'Product Backlog Item' AND [System.IterationPath] = @CurrentIteration" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            committedPBI = result.workItems.length;
            retrieveDonePBI();
        });
    }
    function retrieveDonePBI() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Done') AND [System.WorkItemType] = 'Product Backlog Item' AND [System.IterationPath] = @CurrentIteration" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            donePBI = result.workItems.length;
            retrieveOpenImpediments();
        });
    }
    function retrieveOpenImpediments() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Open') AND [System.WorkItemType] = 'Impediment' AND [System.IterationPath] = @CurrentIteration" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            openImpediments = result.workItems.length;
            buildGrid();
        });
    }
    function buildGrid() {
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
        Controls.create(Grids.Grid, container, options);
        VSS.notifyLoadSucceeded();
    }
});
