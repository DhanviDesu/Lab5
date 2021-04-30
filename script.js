// script.js
const imgIn = document.getElementById("image-input");
const sub = document.querySelector('[type="submit"]');
const form = document.getElementsByTagName('form')[0];
const img = new Image(); // used to load image from <input> and draw to canvas
const volume = document.querySelector('#volume-group input');
let loud = 100;

const buttons = document.querySelectorAll('#button-group button');
const clear = buttons[0];
const read = buttons[1];

volume.addEventListener('click', (e) => {
    loud = volume.value;

    const icon = document.querySelector('#volume-group img');

    if (loud >= 67) {
        icon.src = "icons/volume-level-3.svg";
    } else if (loud >= 34) {
        icon.src = "icons/volume-level-2.svg";
    } else if (loud >= 1) {
        icon.src = "icons/volume-level-1.svg";
    } else {
        icon.src = "icons/volume-level-0.svg";
    }
})

imgIn.addEventListener('change', () => {
    const url = URL.createObjectURL(imgIn.files[0])
    img.src = url;
    img.alt = imgIn.files[0].name
});

window.addEventListener('load', () => {
    speechSynthesis.getVoices();

    setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();

        const select = document.getElementById("voice-selection");
        select.innerHTML = "";
        select.disabled = false;

        for (var i = 0; i < voices.length; i++) {
            var option = document.createElement('option');
            option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

            if (voices[i].default) {
                option.textContent += ' -- DEFAULT';
            }

            option.setAttribute('data-lang', voices[i].lang);
            option.setAttribute('data-name', voices[i].name);
            select.appendChild(option);
        }
    }, 20)
})

form.addEventListener('submit', (e) => {

    //prevent reload  
    e.preventDefault();

    //get text
    const inputs = document.querySelectorAll('#generate-meme input');
    const top = inputs[1].value;
    const bot = inputs[2].value;

    //add to canvas
    const canvas = document.getElementById('user-image');
    const ctx = canvas.getContext('2d');
    ctx.font = '50px Arial';
    ctx.textAlign = "center";
    ctx.strokeText(top, canvas.width / 2, 50);
    ctx.strokeText(bot, canvas.width / 2, canvas.height - 50);

    //toggle buttons
    const buttons = document.querySelectorAll('#button-group button');
    buttons[0].disabled = false;
    buttons[1].disabled = false;

    //voice stuff
    // const voices = window.speechSynthesis.getVoices();

    // const select = document.getElementById("voice-selection");
    // select.innerHTML = "";
    // select.disabled = false;

    // for (var i = 0; i < voices.length; i++) {
    //     console.log(i)
    //     var option = document.createElement('option');
    //     option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    //     if (voices[i].default) {
    //         option.textContent += ' -- DEFAULT';
    //     }

    //     option.setAttribute('data-lang', voices[i].lang);
    //     option.setAttribute('data-name', voices[i].name);
    //     select.appendChild(option);
    // }
});

clear.addEventListener('click', () => {
    const canvas = document.getElementById('user-image');

    //clear canvas
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    //disable buttons
    clear.disabled = true;
    read.disabled = true;
})

read.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#generate-meme input');
    const select = document.getElementById("voice-selection");
    const voices = window.speechSynthesis.getVoices();
    const selectedOption = select.selectedOptions[0].getAttribute('data-name');
    const top = inputs[1].value;
    const bot = inputs[2].value;

    const topUtter = new SpeechSynthesisUtterance(top);
    const botUtter = new SpeechSynthesisUtterance(bot);

    for (let i = 0; i < voices.length; i++) {
        if (voices[i].name === selectedOption) {
            topUtter.voice = voices[i];
            botUtter.voice = voices[i];
        }
    }

    topUtter.volume = loud / 100;
    botUtter.volume = loud / 100;

    speechSynthesis.speak(topUtter);
    speechSynthesis.speak(botUtter);
})


// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
    const canvas = document.getElementById('user-image');

    //clear canvas
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    //toggle buttons? 
    const buttons = document.querySelectorAll('#button-group button');
    buttons[0].disabled = true;
    buttons[1].disabled = true;

    //fill with black
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    //get dimensions
    const dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
    console.log(dimensions);

    //draw image
    context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

    //clear form
    const inputs = document.querySelectorAll('#generate-meme input');
    inputs[1].value = "";
    inputs[2].value = "";
    //voice options?


    // Some helpful tips:
    // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
    // - Clear the form when a new image is selected
    // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
    let aspectRatio, height, width, startX, startY;

    // Get the aspect ratio, used so the picture always fits inside the canvas
    aspectRatio = imageWidth / imageHeight;

    // If the apsect ratio is less than 1 it's a verical image
    if (aspectRatio < 1) {
        // Height is the max possible given the canvas
        height = canvasHeight;
        // Width is then proportional given the height and aspect ratio
        width = canvasHeight * aspectRatio;
        // Start the Y at the top since it's max height, but center the width
        startY = 0;
        startX = (canvasWidth - width) / 2;
        // This is for horizontal images now
    } else {
        // Width is the maximum width possible given the canvas
        width = canvasWidth;
        // Height is then proportional given the width and aspect ratio
        height = canvasWidth / aspectRatio;
        // Start the X at the very left since it's max width, but center the height
        startX = 0;
        startY = (canvasHeight - height) / 2;
    }

    return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}