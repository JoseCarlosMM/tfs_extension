/// <reference path='../sdk/VSS' />
define(["require", "exports", "VSS/Controls", "VSS/Controls/Grids"], function (require, exports, Controls, Grids) {
    var ResolvedFeatures, NewFeatures, ClosedFeatures, ActiveFeatures;
    var projectId;
    var witClient;
    var container = $("#Features");
    VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveActive();
    });
    function retrieveActive() {
        var query = { query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('In Progress') AND [System.WorkItemType] = 'Feature' AND [System.IterationPath] = @CurrentIteration" };
        witClient.queryByWiql(query, projectId).then(function (result) {
            ActiveFeatures = result.workItems.length;
            // Generate an array of all open work item ID's
            var openWorkItems = result.workItems.map(function (wi) { return wi.id; });
            var fields = [
                "System.Title",
                "System.State",
                "Microsoft.VSTS.Common.StateChangeDate",
                "System.AssignedTo"];
            witClient.getWorkItems(openWorkItems, fields).then(function (workItems) {
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
                        { text: " ", index: 1, width: 150 }
                    ]
                };
                Controls.create(Grids.Grid, container, options);
                VSS.notifyLoadSucceeded();
            });
        });
    }
});
