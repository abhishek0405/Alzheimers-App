
const video = document.getElementById('videoInput')
//console.log("labels in video,js",global.labels);
console.log("Face api is",faceapi);
//console.log("Labels are",labels);
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)


function start() {
    document.body.append('Loaded');
    //video.src = '../videos/speech.mp4';

    navigator.getUserMedia(
        { video:{} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )

    recognizeFaces();
}

async function recognizeFaces() {

    const labeledDescriptors = await loadLabeledImages()
    console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    video.addEventListener('play', async () => {

    console.log('Playing')
        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            results.forEach( (result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })
        }, 100);


        



        
    })

}


function loadLabeledImages() {
    //const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye' , 'Jim Rhodes', 'Thor', 'Tony Stark']
    const labels = ['kartik','abhishek','veena'] // for WebCam
    return Promise.all(
        labels.map(async (label)=>{
            const descriptions = []
            

                    for(var i=1;i<=2;i++){
                        const img = await faceapi.fetchImage(`abhishek/${label}/${i}.jpg`)
                        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                        console.log(label + i + JSON.stringify(detections))
                        descriptions.push(detections.descriptor)
                    }
            
            
            document.body.append(label + ' Faces Loaded | ')
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

