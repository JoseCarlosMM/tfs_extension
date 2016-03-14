/// <reference path='../sdk/VSS' />
define(["require", "exports", "TFS/Core/RestClient"], function (require, exports, RestClient) {
    var projectId;
    var container = $("#Tabs");
    var Tabs = [];
    var Client;
    var Collection, param, path, temp = "";
    VSS.require(["VSS/Service", "TFS/Core/RestClient"], function (VSS_Service, TFS_Wit_WebApi) {
        Client = RestClient.getClient();
        retrieveTabs();
    });
    function retrieveTabs() {
        var Tabs = document.getElementById('container');
        //Unauthorized: Access is denied due to invalid credentials.
        /*Client.getProjectCollections().then(function (result) {
            Collection = result.name;
        });*/
        Client.getProjects().then(function (result) {
            if (window.location != window.parent.location) {
                var link = document.createElement('a');
                link.href = document.referrer;
                // Make an split of the url referrer to obtain the collection.
                Collection = link.pathname.split('/')[1];
                param = link.pathname.split('/');
                path = link.pathname;
                for (var i = 1; i <= param.length; i++) {
                    if (param[i] != "_apps") {
                        //obtains collection, name project and team name (if the project has it).
                        temp = temp + "/" + param[i];
                    }
                    else {
                        break;
                    }
                }
                ;
                path = path.substring(temp.length, link.pathname.length);
                for (var j = 0; j < result.length; j++) {
                    var tab = result[j];
                    var element = document.createElement('li');
                    var ClickArea = document.createElement('a');
                    ClickArea.href = link.protocol + "//"
                        + link.host + "/"
                        + Collection + "/"
                        + encodeURIComponent(tab.name)
                        + path;
                    ClickArea.target = "_parent";
                    ClickArea.innerHTML = tab.name;
                    element.appendChild(ClickArea);
                    Tabs.appendChild(element);
                }
            }
            VSS.notifyLoadSucceeded();
        });
    }
});
