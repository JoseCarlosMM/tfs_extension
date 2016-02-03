/// <reference path='../sdk/VSS' />
define(["require", "exports", "VSS/Controls", "VSS/Controls/Grids"], function (require, exports, Controls, Grids) {
    var approvedBugs, committedBugs, bugsDone;
    var projectId;
    var witClient;
    var container = $("#Bugs");
    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveApprovedBugs();
    });
    function retrieveApprovedBugs() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Approved') AND [System.WorkItemType] = 'Bug'" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            approvedBugs = result.workItems.length;
            retrieveCommittedBugs();
        });
    }
    function retrieveCommittedBugs() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Committed') AND [System.WorkItemType] = 'Bug'" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            committedBugs = result.workItems.length;
            retrieveBugsDone();
        });
    }
    function retrieveBugsDone() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Done') AND [System.WorkItemType] = 'Bug'" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            bugsDone = result.workItems.length;
            buildGrid();
        });
    }
    function buildGrid() {
        var options = {
            width: "100%",
            height: "80%",
            source: function () {
                var data = [];
                data.push(["Approved Bugs", approvedBugs]);
                data.push(["Committed Bugs", committedBugs]);
                data.push(["Bugs Done", bugsDone]);
                return data;
            }(),
            columns: [
                { text: "Id.", index: 0, width: 100 },
                { text: "No.", index: 1, width: 100 }
            ]
        };
        Controls.create(Grids.Grid, container, options);
        VSS.notifyLoadSucceeded();
    }
});
