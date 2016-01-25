/// <reference path='../sdk/VSS' />
define(["require", "exports", "VSS/Controls", "VSS/Controls/Grids"], function (require, exports, Controls, Grids) {
    var resolvedUserStories, activeUserStories;
    var projectId;
    var witClient;
    var container = $("#grid-container");
    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveResolvedUserStories();
    });
    function retrieveResolvedUserStories() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Resolved') AND [System.WorkItemType] = 'User Story'" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            resolvedUserStories = result.workItems.length;
            retrieveActiveUserStories();
        });
    }
    function retrieveActiveUserStories() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Active') AND [System.WorkItemType] = 'User Story'" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            activeUserStories = result.workItems.length;
            buildGrid();
        });
    }
    function buildGrid() {
        var options = {
            width: "50%",
            height: "500px",
            source: function () {
                var data = [];
                data.push(["Resolved user stories", resolvedUserStories]);
                data.push(["Active user stories", activeUserStories]);
                return data;
            }(),
            columns: [
                { text: "", index: 0, width: 250 },
                { text: "", index: 1, width: 250 }
            ]
        };
        Controls.create(Grids.Grid, container, options);
        VSS.notifyLoadSucceeded();
    }
});
