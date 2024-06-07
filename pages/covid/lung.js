const URL = "../../models/covid-converted/";
const modelURL = URL + "model.json";
const metadataURL = URL + "metadata.json";

let model, webcam, maxPredictions;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const labelContainer = document.getElementById("label-container");
const labelContainerCam = document.getElementById("label-container-cam");

async function fileToCanvas(file) {
  // Create a new FileReader object to read the file
  const reader = new FileReader();
  reader.onload = function (e) {
    // Create a new image element
    const img = new Image();
    img.onload = async function () {
      // Set canvas dimensions to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      const prediction = await model.predict(canvas);
      labelContainer.innerHTML = "";

      for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
          prediction[i].className + ": " + prediction[i].probability.toFixed(2);

        const ele = document.createElement("h2");
        ele.innerText = classPrediction;
        labelContainer.appendChild(ele);
      }
    };
    // Set the image source to the data URL obtained from FileReader
    img.src = e.target.result;
  };
  // Read the file as a data URL
  reader.readAsDataURL(file);
}

async function uploadImage(event) {
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const file = event.target.files[0];
  await fileToCanvas(file)
    .then((data) => {
      const resultDiv = document.getElementById("result");
    })
    .catch((error) => {
      const resultDiv = document.getElementById("result");
      resultDiv.innerHTML =
        "<p>An error occurred while processing the request.</p>";
    });
}

async function openCam() {
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainerCam.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            labelContainerCam.childNodes[i].innerHTML = classPrediction;
    }
}