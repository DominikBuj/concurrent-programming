
let progress = 0;

function upload() {
    if (progress < 100) {
        ++progress;
        postMessage(progress);
        setTimeout(upload, 100);
    } else progress = 0;
};

onmessage = (e) => {

    // const data = e.data.data;
    // const folderIndex = e.data.folderIndex;
    // const fileIndex = e.data.fileIndex;

    // if (folderIndex == null || fileIndex == null) return;

    // const folder = data.folders[folderIndex];
    // const file = data.clients[fileIndex[0]].files[fileIndex[1]];

    upload();

};
