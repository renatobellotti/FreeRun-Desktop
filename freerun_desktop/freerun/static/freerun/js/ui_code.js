"use strict";

// build the dialogue to select additional files to be displayed
// TODO: return false if no files are available
function update_add_file_dialogue(){
    var dialogContent = "";
    
    // only allow to select files that are not already displayed
    for(var i=0; i<filesList.length; ++i){
        var file = filesList[i];
        if(listOfDisplayedFiles.indexOf(file) === -1){
            file = file.replace(".gpx", "");
            dialogContent += '<div class="row" id="' + file +'"><input type="checkbox" value="' + file + '">' + file + '</input></div>';
        }
    }
    
    $("#add_file_dialogue_checkboxes").html(dialogContent);
};

// open dialogue to display more data files
// TODO: display a message to upload some files if there are no files
$("#open_add_files_dialogue").on("click", function(event){
    update_add_file_dialogue();
    $("#add_file_dialogue").modal("show");
});

// actually add additional elements to the list of displayed files
$("#add_files").on("click", function(event){
    var checkboxes = $("#add_file_dialogue_checkboxes").find(":checkbox");
    
    for(var i=0; i<checkboxes.length; ++i){
        var checkbox = checkboxes[i];
        if(checkbox.checked){
            var value = checkbox.value;
            listOfDisplayedFiles.push(value + ".gpx");
        }
    }
    
    $("#add_file_dialogue").modal("hide");
    updateUI();
});

// add all the new files to the list of the displayed data files
// and add a botton (with a cross in a circle) to remove it again
function produce_row(value){
    return '<li style="list-style-type:none" id="' + value + '">' + value +
                '<button onclick="handleDeleteEvent(this);" style="background:none; border:none;" id="delete_' + value + '">' +
                '<i class="fa fa-times-circle" aria-hidden="true"></i>\
                </button></li>';
}

function updateListOfDisplayedFiles(){
    var content = "";
    for(var i=0; i<listOfDisplayedFiles.length; ++i){
        content += produce_row(listOfDisplayedFiles[i]);
    }
    $("#selected_files_list").html(content);
}

// delete elements from the list of displayed files
function handleDeleteEvent(caller){
    var id = caller.id;
    id = id.replace("delete_", "#");
    $(id).remove();
    var filename = id.replace("#", "") + ".gpx";
    listOfDisplayedFiles.splice(listOfDisplayedFiles.indexOf(filename), 1);
    updateUI();
}

// update the map and the graphs if a file was added/removed
function updateUI(){
    // first remove all layers
    var layers = map.getLayers().getArray();
    /*for(var i=0; i<layers.length; ++i){
        if(!(layers[i] instanceof ol.layer.Tile)){
            map.removeLayer(layers[i]);
            // start again at the beginning because the indices changed
            i = 0;
        }
    }*/
    // iterate in reverse order because items are removed during the iteration --> indices change
    for(var i=layers.length-1; i>=0; --i){
        if(!(layers[i] instanceof ol.layer.Tile)){
            map.removeLayer(layers[i]);
            // no need to adjust the loop variable because the later elements are either non-existent or Tile objects (else they would have been removed)
        }
    }
    
    // then add the needed layers
    for(var i=0; i<listOfDisplayedFiles.length; ++i){
        add_gpx_layer(listOfDisplayedFiles[i]);
    }
    
    // add all curves
    /*for(var i=0; i<listOfDisplayedFiles.length; ++i){
        add_curves(listOfDisplayedFiles[i]);
    }*/
    //alert("updateUI");
    plot_curves(listOfDisplayedFiles);
    
    updateListOfDisplayedFiles();
}

// add a GPX file as a layer to the map
function add_gpx_layer(filename){
    // code from https://openlayers.org/en/latest/examples/gpx.html?q=gpx
    var style = {
        'Point': new ol.style.Style({
          image: new ol.style.Circle({
            fill: new ol.style.Fill({
              color: 'rgba(255,255,0,0.4)'
            }),
            radius: 5,
            stroke: new ol.style.Stroke({
              color: '#ff0',
              width: 1
            })
          })
        }),
        'LineString': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#f00',
            width: 3
          })
        }),
        'MultiLineString': new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#0f0',
            width: 3
          })
        })
    };
      
    var file_url = 'get_file/' + filename;

    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: file_url,
            format: new ol.format.GPX()
        }),
        style: function(feature) {
            return style[feature.getGeometry().getType()];
        }
    });
    
    map.addLayer(vector);
}

// add another curve to the velocity and elevation graphs
/*function add_curves(filename){
    $.getJSON("get_data/" + filename, function(data){
        //alert(data);
        var times = data.time;
        var speeds = data.speed;
        //var datapoints = [];
        /*for(var i=0; i<times.length; ++i){
            datapoints.push({x: times[i], y: speeds[i]});
        }*/
        
        //speeds = [0, 1, 0.5];
        //  var l = [0, 1, 2];
        
        /*datapoints = [
            {x: 0., y: 0.},
            {x: 0.5, y: 0.5},
            {x: 1., y: 1.},
        ];
        
        var dataset = [
            {
                label: filename,
                data: speeds,
                fill: false
            }
        ];
        
        var scales = {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                },
                ticks: {
                    min: times[0],
                    max: times[times.length - 1],
                    stepSize: 10
                }
            }]
        };
        
        speedChart.data.labels = times;
        speedChart.data.datasets = dataset;
        speedChart.options.scales = scales;
        speedChart.update();
    });
}*/

var loaded_data = {};

function load_data(filename){
    return $.getJSON("get_data/" + filename)
            .done(function(data){
                //alert(data);
                // convert time to minutes and speed to km/h
                for(var i=0; i<data.time.length; ++i){
                    data.time[i] /= 60;
                    data.speed[i] *= 3.6;
                }
                loaded_data[filename] = data;
            });
}

// add another curve to the velocity and elevation graphs
function plot_curves(filenames){
    //alert("plot curves");
    var requests = [];
    // load the data if necessary
    for(var i=0; i<filenames.length; ++i){
        if(!(filenames[i] in loaded_data)){
            requests.push(load_data(filenames[i]));
        }
    }
    
    var speedDataToPlot = [];
    
    //alert("before when");
    
    // execute this when all requests are done, i. e. all data is loaded
    $.when(...requests).then(function(){
        //alert("in when");
        var test = loaded_data;
        Object.keys(loaded_data).forEach(function(key){
            var data = loaded_data[key];
            var speedCurve = {
                x: data.time,
                y: data.speed,
                mode: "lines"
            }
            //alert("push");
            speedDataToPlot.push(speedCurve);
        });
        
        var speedLayout = {
            title: "Speed",
            xaxis: {
                title: "Time [min]"
            },
            yaxis: {
                title: "Speed [km/h]"
            }
        };
        
        Plotly.newPlot("speed_plot", speedDataToPlot, speedLayout);
    });
    
}
