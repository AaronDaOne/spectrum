const audioElem = document.getElementById("audioFile");
const canvas = document.getElementById("mainCanvas");
const canvasCtx = canvas.getContext("2d");

const WIDTH = 1000;
const HEIGHT = 500;

canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

let audioContextInit = false;
document.addEventListener("click", () => {
	if (audioContextInit) return;

	audioContextInit = true;
	audioElem.play()
	const audioCtx = new AudioContext();
	const audioSource = audioCtx.createMediaElementSource(audioElem);
	const analyser = audioCtx.createAnalyser();
	analyser.minDecibels = -45;
	analyser.maxDecibels = 0;
	// analyser.smoothingTimeConstant = 0.1
	audioSource.connect(analyser);
	analyser.connect(audioCtx.destination);

	analyser.fftSize = 4096;
	const bufferLength = analyser.frequencyBinCount;
	console.log(bufferLength);
	const dataArray = new Uint8Array(Math.floor(bufferLength / 55));
	
	let lastTime = performance.now()

	function draw() {
		requestAnimationFrame(draw);
		
		// fps counter
		console.log(1000/(performance.now() - lastTime));
		lastTime = performance.now()
		
		analyser.getByteFrequencyData(dataArray);

		canvasCtx.fillStyle = "rgb(0 0 0)";
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
		const barWidth = (WIDTH / dataArray.length) * 2.5;
		let barHeight;

		for (let i = 0; i < dataArray.length; i++) {
			barHeight = dataArray[i];

			// canvasCtx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
			// canvasCtx.fillRect(
			// 	i * barWidth,
			// 	HEIGHT - barHeight / 2,
			// 	barWidth,
			// 	barHeight / 2
			// );

			if (i === 0) {
				// first
				canvasCtx.beginPath();
				canvasCtx.moveTo(0, 0);
			} else if (i === dataArray.length - 1) {
				// last
				canvasCtx.quadraticCurveTo(
					i * barWidth,
					barHeight,
					(i + 0.5) * barWidth,
					0
				);
			} else {
				// middle
				canvasCtx.quadraticCurveTo(
					i * barWidth,
					barHeight,
					(i + 0.5) * barWidth,
					(barHeight + dataArray[i + 1]) / 2
				);
			}
		}
		canvasCtx.closePath();
		canvasCtx.fillStyle = "#fff";
		canvasCtx.fill();
	}

	draw();
});
