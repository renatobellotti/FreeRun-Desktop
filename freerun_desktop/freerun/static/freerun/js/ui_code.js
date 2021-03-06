"use strict";

// orange, blue, green, brown, magenta, black
var COLOURS = ["#ff6600", "#0000ff", "#00ff00", "#663300", "#cc0099", "#000000"];

function get_colour(filename){
    return COLOURS[listOfDisplayedFiles.indexOf(filename) % COLOURS.length];
}

// build the dialogue to select additional files to be displayed
// TODO: return false if no files are available
function update_add_file_dialogue(){
    var dialogContent = "";
    
    // only allow to select files that are not already displayed
    for(var i=0; i<filesList.length; ++i){
        var file = filesList[i];
        if(listOfDisplayedFiles.indexOf(file) === -1){
            file = file.replace(".gpx", "");
            var date = new Date(parseInt(file)*1000);
            dialogContent += '<div class="row" id="' + file +'"><input type="checkbox" value="' + file + '">' + date.toLocaleDateString() + '</input></div>';
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
function produce_row(filename){
    var stamp = filename.replace(".gpx", "");
    var date = new Date(parseInt(stamp)*1000);
    return '<li style="list-style-type:none" id="' + stamp + '">' + date.toLocaleDateString() +
                '<button onclick="handleDeleteEvent(this);" style="background:none; border:none;" id="delete_' + stamp + '">' +
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
    
    // plot speed and elevation curves
    plot_curves(listOfDisplayedFiles);
    
    // show the user what files are currently displayed
    updateListOfDisplayedFiles();
}

// add a GPX file as a layer to the map
function add_gpx_layer(filename){
    // code adapted from https://openlayers.org/en/latest/examples/gpx.html?q=gpx
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
            color: get_colour(filename),
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

var loaded_data = {};

function load_data(filename){
    return $.getJSON("get_data/" + filename)
            .done(function(data){
                // convert time to minutes and speed to km/h, elevation data should only contain the difference to the start point
                var initialElevation = null;
                var filteredData = {
                    time: [],
                    speed: [],
                    elevation: []
                };
                
                // filter the data:
                // setup filter parameters and tools
                var VELOCITY_LIMIT = 30./3.6;
                var AVERAGE_N = 31;  // should be an odd integer
                var last_speeds = [];
                
                function average_array(arr){
                    var sum = 0.;
                    for(var i=0; i<arr.length; ++i){
                        sum += arr[i];
                    }
                    return sum/arr.length;
                }
                
                // filter
                for(var i=0; i<data.time.length; ++i){
                    // remove first minute because the data in this time interval might not be precise (tested using a Fairphone 1)
                    if(data.time[i] < 60){
                        continue;
                    }else if(initialElevation === null){
                        initialElevation = data.elevation[i];
                    }
                    
                    // remove points where the velocity is too big
                    if(data.speed[i] >= VELOCITY_LIMIT){
                        continue;
                    }
                    
                    filteredData.time.push(data.time[i]/60);
                    filteredData.speed.push(data.speed[i]*3.6);
                    filteredData.elevation.push(data.elevation[i] - initialElevation);
                }
                
                // average over AVERAGE_N points around each point
                var half_width = Math.floor(AVERAGE_N/2);
                var averagedSpeed = filteredData.speed.slice();
                // move the window with centre index i
                for(var i=half_width; i+half_width<filteredData.time.length; ++i){
                    var sum = 0.;
                    // take the average over the window of size AVERAGE_N
                    for(var j=i-half_width; j<=i+half_width; ++j){
                        sum += filteredData.speed[j];
                    }
                    averagedSpeed[i] = sum/AVERAGE_N;
                }
                
                filteredData.speed = averagedSpeed
                
                
                loaded_data[filename] = filteredData;
            });
}

// add another curve to the velocity and elevation graphs
function plot_curves(filenames){
    var requests = [];
    // load the data if necessary
    for(var i=0; i<filenames.length; ++i){
        if(!(filenames[i] in loaded_data)){
            requests.push(load_data(filenames[i]));
        }
    }
    
    var speedDataToPlot = [];
    var elevationDataToPlot = [];
    
    // execute this when all requests are done, i. e. all data is loaded
    $.when(...requests).then(function(){
        listOfDisplayedFiles.forEach(function(filename){
            var date = new Date(parseInt(filename.replace(".gpx", ""))*1000);
            var label = date.toLocaleDateString();
            
            var data = loaded_data[filename];
            var speedCurve = {
                x: data.time,
                y: data.speed,
                name: label,
                mode: "lines",
                line: {
                    color: get_colour(filename)
                }
            };
            
            var elevationCurve = {
                x: data.time,
                y: data.elevation,
                name: label,
                mode: "lines",
                line: {
                    color: get_colour(filename)
                }
            }
            
            speedDataToPlot.push(speedCurve);
            elevationDataToPlot.push(elevationCurve);
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
        
        var elevationLayout = {
            title: "Height differences",
            xaxis: {
                title: "Time [min]"
            },
            yaxis: {
                title: "Elevation difference [m]"
            }
        };
        
        Plotly.newPlot("speed_plot", speedDataToPlot, speedLayout);
        Plotly.newPlot("elevation_plot", elevationDataToPlot, elevationLayout);
    });
}
