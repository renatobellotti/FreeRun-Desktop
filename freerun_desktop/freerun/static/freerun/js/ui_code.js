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
    for(var i=0; i<layers.length; ++i){
        if(!(layers[i] instanceof ol.layer.Tile)){
            map.removeLayer(layers[i]);
        }
    }
    
    // then add the needed layers
    for(var i=0; i<listOfDisplayedFiles.length; ++i){
        add_gpx_layer(listOfDisplayedFiles[i]);
    }
    
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
