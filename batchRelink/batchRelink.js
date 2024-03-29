﻿#target "InDesign-8.0"

/*
Relinks all document link to a new folder
Currently file names are G####.ext & extension is set to ".tiff"
*/

var panelFolder = Folder.selectDialog("Pick panel folder");
var relinkFolder = Folder.selectDialog("Pick new link folder");

var panelFiles = panelFolder.getFiles("*.indd");

var back = "_BW"; var ext = ".tiff";
var badPanels = [];
var writeLog = false; 

// Progress bar
var w = new Window("palette");
w.progressBar = w.add ('progressbar', undefined, 0, panelFiles.length);
w.progressBar.preferredSize.width = 300;
w.show();

for(var j = 0; j < panelFiles.length; j++) {
    var doc = app.open(panelFiles[j], false);
    var badImages = []; var errorHappened = false;
    
    w.progressBar.value = j+1;

    for(var i = 0; i < doc.links.length; i++) {
        var gNum = doc.links[i].name.slice(0, 5);
        var fileExt = doc.links[i].name.split(".")[1];

        // Skip PDFs that don't start with "g" because they're
        // most likely other panel files (ie. TL Dates)
        if(gNum[0] === "g" || fileExt !== "pdf") {
            try {
                var newLink = new File(relinkFolder + "/" + gNum + back + ext);
                doc.links[i].relink(newLink);
            
            // Raise flags when file isn't found & log g# 
            } catch (error) {
                errorHappened = true;
                writeLog = true;
                badImages.push(gNum);
            }
        }
    }
    
    // Log panel code & missing g#s in that panel
    if(errorHappened) {
        var badDoc = doc.name.split(".")[0];
        badPanels.push(badDoc + ": " + badImages.join(", "));
    }
    
    doc.save();
    doc.close();
}

// Write a .txt log to list panels with missing g#s
if(writeLog) {
    alert("Some images were not re-linked\r See batchRelinkLog.txt on Desktop.");
    
    var logFile = new File("~/Desktop/batchRelinkLog.txt");
    logFile.encoding = "UTF-8";
    
    logFile.open("w");
    logFile.write(badPanels.join("\n"));
    logFile.close();
}