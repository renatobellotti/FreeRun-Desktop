// build the dialogue to select additional files to be displayed
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
$("#open_add_files_dialogue").on("click", function(event){
    update_add_file_dialogue();
    $("#add_file_dialogue").modal("show");
});

// actually add additional elements to the list of displayed files
$("#add_files").on("click", function(event){
    var checkboxes = $("#add_file_dialogue_checkboxes").find(":checkbox");
    
    var content = $("#selected_files_list").html();
    for(var i=0; i<checkboxes.length; ++i){
        var checkbox = checkboxes[i];
        if(checkbox.checked){
            // add all the new files to the list of the displayed data files
            // and add a botton (with a cross in a circle) to remove it again
            var value = checkbox.value;
            content += '<li style="list-style-type:none" id="' + value + '">' + value +
                '<button onclick="handleDeleteEvent(this);" style="background:none; border:none;" id="delete_' + value + '">' +
                '<i class="fa fa-times-circle" aria-hidden="true"></i>\
                </button></li>';
            
            listOfDisplayedFiles.push(value + ".gpx");
        }
    }
    
    $("#selected_files_list").html(content);
    $("#add_file_dialogue").modal("hide");
});

// delete elements from the list of displayed files
function handleDeleteEvent(caller){
    var id = caller.id;
    id = id.replace("delete_", "#");
    $(id).remove();
    var filename = id.replace("#", "") + ".gpx";
    listOfDisplayedFiles.splice(listOfDisplayedFiles.indexOf(filename), 1);
}
