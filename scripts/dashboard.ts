 /// <reference path='../sdk/VSS' />

import Controls = require("VSS/Controls");
import Grids = require("VSS/Controls/Grids");

var container = $("#grid-container");
var gridOptions: Grids.IGridOptions = {
    height: "400px",
    width: "40%",
    source: function () {
        var result = [], i;
        for (i = 0; i < 100; i++) {
            result[result.length] = [i, "Contenido de prueba"];
        }

        return result;
    } (),
    columns: [
        { text: "Columna 1", index: 0, width: 200 },
        { text: "Columna 2", index: 1, width: 200}]
};

Controls.create<Grids.Grid, Grids.IGridOptions>(Grids.Grid, container, gridOptions);

VSS.notifyLoadSucceeded();