
function upload(progress, speed) {
    if (progress < 100) {
        ++progress;
        postMessage(progress);
        setTimeout(upload.bind(null, progress, speed), speed);
    }
}

onmessage = (e) => {

    const size = e.data;
    const progress = 0;
    const speed = ((size - 0.01) / (1 - 0.01)) * (75 - 25) + 25;

    upload(progress, speed);

}
