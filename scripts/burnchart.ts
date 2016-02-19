 /// <reference path='../sdk/VSS' />
import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");
import TFS_Wit_WebApi = require("TFS/WorkItemTracking/RestClient");
import Work_Client = require("TFS/Work/RestClient");
import VSS_Service = require("VSS/Service");
import WebApi_Constants = require("VSS/WebApi/Constants");
import Work_Contracts = require("TFS/Work/Contracts");
import TFS_Core_Contracts = require("TFS/Core/Contracts");

var url, param, resultado;
var path="";//, Iteration = "";
var projectId;
var witClient;
var iterationPath;
var container = $("#Burnchart");




VSS.require(["VSS/Service", "TFS/WorkItemTracking/RestClient"],  
    function (VSS_Service, TFS_Wit_WebApi) {
        projectId = VSS.getWebContext().project.id;
        witClient = VSS_Service.getCollectionClient(TFS_Wit_WebApi.WorkItemTrackingHttpClient);
        getURL();
});
// Get the Web Context to create the uri to navigate to
function getURL(): void{
    if (window.location != window.parent.location) {
        var link = document.createElement('a');
        link.href = document.referrer;
        // Make an split of the url referrer.
        param = link.pathname.split('/');
        for (var i = 1; i <= param.length; i++) {
            if(param[i] !="_apps"){
            	//obtains collection, name project and team name (if the project has it).
                path = path + "/"+ param[i];
                /*if(i>=2){
                    if(Iteration == ""){
                        Iteration = param[i] + "\\";
                    }
                    else{
                        Iteration = Iteration + param[i] + "\\" ;    
                    }
                }*/
            }
            else{break;}
        };
        

        var webContext = VSS.getWebContext();
     	var workClient: Work_Client.WorkHttpClient = VSS_Service.VssConnection
            .getConnection()
            .getHttpClient(Work_Client.WorkHttpClient, WebApi_Constants.ServiceInstanceTypes.TFS);
        var teamContext: TFS_Core_Contracts.TeamContext = { projectId: webContext.project.id, teamId: webContext.team.id, project: "", team: "" };
        workClient.getTeamIterations(teamContext, "current").then((iterations: Work_Contracts.TeamSettingsIteration[]) => {
            if (iterations.length > 0) {
                iterationPath = iterations[0].path;
                // Build the url to show the burnchart.
                url = link.protocol+"//"
                +link.host
                + path 
                + "/_api/_teamChart/Burndown?chartOptions=%7B%22Width%22%3A936%2C%22Height%22%3A503%2C%22ShowDetails%22%3Atrue%2C%22Title%22%3A%22%22%7D&counter=2&iterationPath="
                + encodeURIComponent(iterationPath)
                +"&__v=5";
                console.log(url);

                document.getElementById("imgBurnChart").setAttribute("src", url);
            }
            else {
            }
        }, (error) => {
            // If the iteration is less than 0, show an alert.
            alert("Unexpected error trying to obtain the Burnchart.");
        });
    }
    else{
    	// If the location child equals to the parent, show an alert.
        alert("Unexpected error trying to obtain the Burnchart.");
    }    
    VSS.notifyLoadSucceeded();
}

