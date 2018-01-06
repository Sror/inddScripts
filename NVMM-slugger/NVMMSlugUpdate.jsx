﻿#target InDesign

// Allow the user to select a folder of INDD layout files
// and establish variables for the folder and each individual file,
var myFolder = Folder.selectDialog("*****     Please select a folder of panels     *****");

// Use try/catch in case user cancels out of folder select dialog
try{
    var myInddFiles = myFolder.getFiles("*.indd");
    main();

} catch(error) {
    if(error instanceof TypeError) {
        alert("No folder selected");
    }
}

// Using a main() function so the entire try block above isn't super long...
function main() {
    // These are declared here so they can be used by dialogSetup()
    var myWindow; var batchEditText; var reviewEditText; var dateEditText;
    var batchReviewCheck; var dateCheck;

    var badFilesList = [];

    dialogSetup();

    
    if(myWindow.show() == true) {
        
        
        //Establish a loop to deal with all the files:
        for(k=0; k<myInddFiles.length; k++) {

            // If no checkboxes are selected, break out of loop and let user know
            if(batchReviewCheck.value == false && dateCheck.value == false) {
                var noUpdates = true;
                break;
            }

            var myDocument = app.open(myInddFiles[k]);
            var codeInfoLayer = myDocument.layers.item("Code and info");

            // Log files that have missing "Code and info" layer
            // and continue to next file in the loop
            // (Better than breaking and losing progress)
            if(!codeInfoLayer.isValid) {
                var missingLayer = true;
                badFilesList.push(myDocument.name.split(".")[0]);
                myDocument.close();
                continue;
            }
            
            codeInfoLayer.locked = false;
            codeInfoLayer.move(LocationOptions.BEFORE, myDocument.layers[0]);
            
            var codeInfoFrames = codeInfoLayer.textFrames;

            if(batchReviewCheck.value == true && dateCheck.value == true) {
                for(var i = 0; i < codeInfoFrames.length; i++) {
                    updateBatchReview();
                    updateDate();
                }
            } else if(batchReviewCheck.value == true) {
                for(var i = 0; i < codeInfoFrames.length; i++) {
                    updateBatchReview();
                }
            } else if(dateCheck.value == true) {
                for(var i = 0; i < codeInfoFrames.length; i++) {
                    updateDate();
                }
            }

            //Re-lock Code and info layer
            myDocument.layers.item("Code and info").locked = true;

            myDocument.save();
            myDocument.close();
        }
        
        if(noUpdates){
            alert("No updates made!\r Select a field to update.");

        } else if(missingLayer) {
            alert('"Code and info" layer missing from:\r' + badFilesList.join("\r"));
        
        } else {
            alert("Oh, did you just blink? \rYou missed a lot of fun.\r" + myInddFiles.length + " files processed.");
        }
        
    } else {
        app.dialogs.everyItem().destroy()
    }
    

    function dialogSetup() {
        var today = getTodaysDate();

        myWindow = new Window("dialog", "Panels are CHILL");
        
        // Row 1
        var inputRow1 = myWindow.add("group {alignment: 'left'}");
        
        // Batch & Review
        batchReviewCheck = inputRow1.add("checkbox {size: [60, 15], text: '\u00A0Batch:'}");
        batchReviewCheck.onClick = function() {
            if(batchReviewCheck.value == true) {
                batchEditText.enabled = true;
                reviewEditText.enabled = true;
            } else {
                batchEditText.enabled = false;
                reviewEditText.enabled = false;
            }

        };

        batchEditText = inputRow1.add('edittext {text: "1", size: [40, 27], enabled: false}');
        
        var reviewStaticText = inputRow1.add('statictext {text: "Review:", size: [55, 25], alignment: "bottom", justify: "right"}');
        reviewEditText = inputRow1.add('edittext {text: "1", size: [40, 27], enabled: false}');

        // Row 2
        var inputRow2 = myWindow.add('group {alignment: "left"}');

        // Date
        dateCheck = inputRow2.add("checkbox {size: [60, 15], text: '\u00A0Date:'}");
        dateCheck.onClick = function() {
            if(dateCheck.value == true) {
                dateEditText.enabled = true;
            } else {
                dateEditText.enabled = false;
            }
        }

        dateEditText = inputRow2.add("edittext {size: [155, 27], enabled: false}");
        dateEditText.text = today;
        
        // Buttons
        var buttonGroup = myWindow.add("group {alignment: 'right'}");
        buttonGroup.add ("button", undefined, "OK");
        buttonGroup.add ("button", undefined, "Cancel");
    }


    function getTodaysDate() {
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];    
        var timeStamp = new Date();

        return monthNames[timeStamp.getMonth()] + " " + timeStamp.getDate() + ", " + timeStamp.getFullYear();
    }


    function updateBatchReview(){
        if(codeInfoFrames[i].label === "batchReviewInput") {
            codeInfoFrames[i].contents = "Batch " + batchEditText.text + " - " + "Review " + reviewEditText.text;
        }
    }


    function updateDate(){
        if(codeInfoFrames[i].label === "dateInput") {
            codeInfoFrames[i].contents = dateEditText.text;
        }
    }

}