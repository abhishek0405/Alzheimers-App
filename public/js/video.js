const video = document.getElementById("videoInput");
//var labels = document.getElementById("labels").innerHTML;
//var famphotos = document.getElementById("famphotos").innerHTML;
var famphotosFiles = document.getElementById("famphotosFiles").innerHTML;
console.log(labels);
console.log(famphotos);
console.log("famphotos");
//labels = labels.split(",");
//labels = labels.map((word) => word.toLowerCase());
//console.log("labels in video,js",global.labels);
console.log("Face api is", faceapi);
//console.log("Labels are",labels);
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"), //heavier/accurate version of tiny face detector
]).then(start);

function start() {
  //video.src = '../videos/speech.mp4';

  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );

  recognizeFaces();
}

async function recognizeFaces() {
  const labeledDescriptors = await loadLabeledImages();
  console.log(labeledDescriptors);
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

  video.addEventListener("play", async () => {
    console.log("Playing");
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvas);
      });
    }, 100);
  });
}

async function loadLabeledImages() {
  //const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye' , 'Jim Rhodes', 'Thor', 'Tony Stark']
  //const labels = ["kartik", "abhishek", "veena", "lakshmi", "ananth"]; // for WebCam
  //var j = 0
  try {
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = [];
        console.log(label)
        console.log("label is", famphotos[label].length);

        for (var i = 0; i < famphotos[label].length; i++) {
          //const img_name = `uploads/${label}/1.jpg`;
          var imgs = new Image(); // width, height
          imgs.src = "data:image/jpg;base64," + famphotos[label][i];
          imgs.style.display = "none";
          imgs.id = label + "-" + i;
          document.body.appendChild(imgs);
          /*document.getElementById('pic')
              .setAttribute(
                  'src', 'data:image/png;base64,'+ famphotos[label][i]
              );*/
          //console.log("base encoded string", famphotos[j][i] )
          var input = document.getElementById(label + "-" + i);
          console.log(input);
          console.log("input");

          //var img = await faceapi.fetchImage(input);
          //console.log(img_name);
          var detections = await faceapi
            .detectSingleFace(input)
            .withFaceLandmarks()
            .withFaceDescriptor();
          //console.log(label + i + JSON.stringify(detections));
          // console.log(detections);
          descriptions.push(detections.descriptor);
        }
        //j += 1
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  } catch (e) {
    console.log(e);
  }
}
