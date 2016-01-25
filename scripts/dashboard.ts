 /// <reference path='../sdk/VSS' />

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");
import VSS_Service = require("VSS/Service");


var resolvedUserStories, activeUserStories;
var projectId;
var witClient;
var container = $("#grid-container");



VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"],  
    function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        retrieveResolvedUserStories();
});


function retrieveResolvedUserStories() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Resolved') AND [System.WorkItemType] = 'User Story'"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        resolvedUserStories = result.workItems.length;
        retrieveActiveUserStories();
    });
}

function retrieveActiveUserStories() : void {
    var query = {query: "SELECT [System.Id] FROM WorkItem WHERE [System.State] IN ('Active') AND [System.WorkItemType] = 'User Story'"};
    witClient.queryByWiql(query, projectId).then(function (result) {
        activeUserStories = result.workItems.length;
        buildGrid();
    });
}


function buildGrid(): void {
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
    Controls.create<Grids.Grid, Grids.IGridOptions>(Grids.Grid, container, options);
    VSS.notifyLoadSucceeded();
}




