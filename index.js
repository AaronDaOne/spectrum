const audioPlayer = document.getElementById("audioFile");
const canvas = document.getElementById("mainCanvas");
const canvasCtx = canvas.getContext("2d");

let width = 1000;
let height = 500;

let circle_center = [width / 2, height / 2];
const CIRCLE_RADIUS = 150;

const BUFFER_LENGTH = 2048;

const BASS_RANGE_START = 1;
const BASS_RANGE_END = 14;
const BASS_LENGTH = BASS_RANGE_END - BASS_RANGE_START;

canvasCtx.clearRect(0, 0, width, height);

let audioContextInit = false;
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

const vis = {
	TRAP_NATION: 0,
	COLORED_BARS: 1,
	WHITE_BARS: 2,
};

var currenVisualizer = vis.TRAP_NATION;

document.addEventListener("click", () => {
	if (audioContextInit) return;
	// return;
	audioContextInit = true;
	if (audioPlayer.src) {
		audioPlayer.play();
	}
	const audioSource = audioCtx.createMediaElementSource(audioPlayer);
	analyser.minDecibels = -45;
	analyser.maxDecibels = 0;
	// analyser.smoothingTimeConstant = 0.1
	audioSource.connect(analyser);
	analyser.connect(audioCtx.destination);

	analyser.fftSize = BUFFER_LENGTH * 2;
	const bufferLength = analyser.frequencyBinCount;
	console.log(bufferLength);
	const dataArray = new Uint8Array(bufferLength);

	// let lastTime = performance.now();

	function draw() {
		requestAnimationFrame(draw);

		// fps counter
		// console.log(1000 / (performance.now() - lastTime));
		// lastTime = performance.now();

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		width = window.innerWidth;
		height = window.innerHeight;

		analyser.getByteFrequencyData(dataArray);

		// const barWidth = (width / dataArray.length) * 2.5;

		// canvasCtx.closePath();
		// canvasCtx.fill();
		switch (currenVisualizer) {
			case vis.WHITE_BARS:
				barsVisualizer(dataArray);
				break;

			case vis.COLORED_BARS:
				coloredBarsVizualizer(dataArray);
				break;

			case vis.TRAP_NATION:
				trapNationVisualizer(dataArray);
			default:
				break;
		}
	}

	draw();
});

function barsVisualizer(dataArray) {
	canvasCtx.fillStyle = "rgb(0 0 0)";
	canvasCtx.fillRect(0, 0, width, height);
	canvasCtx.fillStyle = "#fff";

	const bass =
		dataArray
			.slice(BASS_RANGE_START, BASS_RANGE_END)
			.reduce((accumulator, currentValue) => {
				return accumulator + currentValue;
			}, 0) /
		(BASS_LENGTH * 255);

	const bars = 10;
	const barsMargin = width / 100;
	const barWidth = width / 80;
	const newDataArray = interpolateToLength(
		dataArray.slice(BASS_RANGE_START, BASS_RANGE_END),
		bars
	)
		.map((x) => Math.max(barWidth / 2, x))
		.reverse();

	const screenCenter = [width / 2, height / 2];

	canvasCtx.translate(screenCenter[0], screenCenter[1]);
	canvasCtx.rotate((-30 * Math.PI) / 180);
	canvasCtx.scale(1 + bass, 1 + bass);

	for (let i = 0; i < newDataArray.length; i++) {
		canvasCtx.beginPath();
		canvasCtx.roundRect(
			i * (barWidth + barsMargin) -
				(bars / 2) * barWidth -
				((bars - 1) / 2) * barsMargin,
			-newDataArray[i],
			barWidth,
			newDataArray[i] * 2,
			barWidth
		);
		canvasCtx.fill();
	}
}

function coloredBarsVizualizer(dataArray) {
	canvasCtx.fillStyle = "rgb(0 0 0)";
	canvasCtx.fillRect(0, 0, width, height);
	canvasCtx.fillStyle = "#fff";

	const bass =
		dataArray
			.slice(BASS_RANGE_START, BASS_RANGE_END)
			.reduce((accumulator, currentValue) => {
				return accumulator + currentValue;
			}, 0) /
		(BASS_LENGTH * 255);

	const bars = 29;
	const barsMargin = 0;
	const barWidth = width / bars;
	const newDataArray = interpolateToLength(
		dataArray.slice(BASS_RANGE_START, BASS_RANGE_END),
		bars
	);

	const screenCenter = [width / 2, height / 2];

	canvasCtx.translate(screenCenter[0], screenCenter[1]);
	canvasCtx.scale(1 + bass / 2, 1 + bass / 2);

	if (bars % 2 === 0) {
		// even
		for (let i = 0; i < newDataArray.length; i++) {
			canvasCtx.fillStyle = `hsl(${
				i * 20 - performance.now() * 0.7
			}, 100%, 50%)`;
			canvasCtx.beginPath();
			canvasCtx.roundRect(
				// screenCenter[0] +
				i * (barWidth + barsMargin) -
					(bars / 2) * barWidth -
					((bars - 1) / 2) * barsMargin,
				// screenCenter[1] -
				newDataArray[i],
				barWidth,
				newDataArray[i] * 2,
				barWidth
			);
			canvasCtx.fill();
		}
	} else {
		// odd
		for (let i = 0; i < newDataArray.length; i++) {
			canvasCtx.fillStyle = `hsl(${
				i * 20 - performance.now() * 0.7
			}, 100%, 50%)`;
			canvasCtx.beginPath();
			canvasCtx.roundRect(
				// screenCenter[0] +
				i * (barWidth + barsMargin) -
					(bars / 2) * barWidth -
					Math.floor(bars / 2) * barsMargin,
				// screenCenter[1]
				-newDataArray[i],
				barWidth,
				newDataArray[i] * 2,
				barWidth
			);
			canvasCtx.fill();
		}
	}
}

function trapNationVisualizer(dataArray) {
	canvasCtx.fillStyle = "rgb(0 0 0)";
	canvasCtx.fillRect(0, 0, width, height);
	const bass =
		dataArray
			.slice(BASS_RANGE_START, BASS_RANGE_END)
			.reduce((accumulator, currentValue) => {
				return accumulator + currentValue;
			}, 0) /
		(BASS_LENGTH * 255);

	const screenCenter = [width / 2, height / 2];
	canvasCtx.translate(screenCenter[0], screenCenter[1]);
	canvasCtx.scale(1 + bass, 1 + bass);
	// console.log(bass);
	// const bassColor = bass * 360;
	canvasCtx.fillStyle = `hsl(${performance.now() / 10}, 100%, 50%)`;
	// canvasCtx.fillStyle = `rgb(${bassColor},${bassColor},${bassColor})`;
	// canvasCtx.beginPath();
	// canvasCtx.arc(
	// 	circle_center[0],
	// 	circle_center[1],
	// 	CIRCLE_RADIUS + bass * 50,
	// 	0,
	// 	2 * Math.PI
	// );
	// canvasCtx.fill();
	const bassBoostedDataArray = dataArray
		// .map((x) => x + bass * 50)
		.slice(1, 14);
	drawCircleSpectrum(bassBoostedDataArray, [0, 0], CIRCLE_RADIUS);
	canvasCtx.fill();
	drawLeftCircleSpectrum(bassBoostedDataArray, [0, 0], CIRCLE_RADIUS);
	canvasCtx.fill();
}

function pointToCirclePoint(i, arrMax, barHeight) {
	let iPIRatio = (i * Math.PI) / arrMax;

	let x = circle_center[0] + (CIRCLE_RADIUS + barHeight) * Math.sin(iPIRatio);
	let y = circle_center[1] - (CIRCLE_RADIUS + barHeight) * Math.cos(iPIRatio);

	return [x, y];
}

function drawCircleSpectrum(dataArray, circle_center, CIRCLE_RADIUS) {
	let barHeight;
	for (let i = 0; i < dataArray.length; i++) {
		barHeight = dataArray[i];

		// canvasCtx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
		// canvasCtx.fillRect(
		// 	i * barWidth,
		// 	height - barHeight / 2,
		// 	barWidth,
		// 	barHeight / 2
		// );

		if (i === 0) {
			// first
			canvasCtx.beginPath();
			canvasCtx.moveTo(
				circle_center[0],
				circle_center[1] - CIRCLE_RADIUS
			);
		} else if (i === dataArray.length - 1) {
			// last
			let [cx, cy] = pointToCirclePoint(i, dataArray.length, barHeight);
			canvasCtx.quadraticCurveTo(
				cx,
				cy,
				circle_center[0],
				circle_center[1] + CIRCLE_RADIUS
			);
			// canvasCtx.quadraticCurveTo(
			// 	i * barWidth,
			// 	barHeight,
			// 	(i + 0.5) * barWidth,
			// 	0
			// );
		} else {
			// middle

			let [cx, cy] = pointToCirclePoint(i, dataArray.length, barHeight);
			let [x, y] = pointToCirclePoint(
				i + 0.5,
				dataArray.length,
				(barHeight + dataArray[i + 1]) / 2
			);
			// console.log(cx, cy, x, y);
			canvasCtx.quadraticCurveTo(cx, cy, x, y);
			// canvasCtx.quadraticCurveTo(
			// 	i * barWidth,
			// 	barHeight,
			// 	(i + 0.5) * barWidth,
			// 	(barHeight + dataArray[i + 1]) / 2
			// );
		}
	}
}

function pointToLeftCirclePoint(i, arrMax, barHeight) {
	let iPIRatio = (i * Math.PI) / arrMax;

	let x = circle_center[0] - (CIRCLE_RADIUS + barHeight) * Math.sin(iPIRatio);
	let y = circle_center[1] - (CIRCLE_RADIUS + barHeight) * Math.cos(iPIRatio);

	return [x, y];
}

function drawLeftCircleSpectrum(dataArray, circle_center, CIRCLE_RADIUS) {
	let barHeight;
	for (let i = 0; i < dataArray.length; i++) {
		barHeight = dataArray[i];

		// canvasCtx.fillStyle = `rgb(${barHeight + 100} 50 50)`;
		// canvasCtx.fillRect(
		// 	i * barWidth,
		// 	height - barHeight / 2,
		// 	barWidth,
		// 	barHeight / 2
		// );

		if (i === 0) {
			// first
			canvasCtx.beginPath();
			canvasCtx.moveTo(
				circle_center[0],
				circle_center[1] - CIRCLE_RADIUS
			);
		} else if (i === dataArray.length - 1) {
			// last
			let [cx, cy] = pointToLeftCirclePoint(
				i,
				dataArray.length,
				barHeight
			);
			canvasCtx.quadraticCurveTo(
				cx,
				cy,
				circle_center[0],
				circle_center[1] + CIRCLE_RADIUS
			);
			// canvasCtx.quadraticCurveTo(
			// 	i * barWidth,
			// 	barHeight,
			// 	(i + 0.5) * barWidth,
			// 	0
			// );
		} else {
			// middle

			let [cx, cy] = pointToLeftCirclePoint(
				i,
				dataArray.length,
				barHeight
			);
			let [x, y] = pointToLeftCirclePoint(
				i + 0.5,
				dataArray.length,
				(barHeight + dataArray[i + 1]) / 2
			);
			// console.log(cx, cy, x, y);
			canvasCtx.quadraticCurveTo(cx, cy, x, y);
			// canvasCtx.quadraticCurveTo(
			// 	i * barWidth,
			// 	barHeight,
			// 	(i + 0.5) * barWidth,
			// 	(barHeight + dataArray[i + 1]) / 2
			// );
		}
	}
}

function interpolateToLength(arr, newLength) {
	if (arr.length < 2 || newLength < 2) {
		throw new Error("Both arrays must have at least 2 elements.");
	}
	const result = [];
	const scale = (arr.length - 1) / (newLength - 1);

	for (let i = 0; i < newLength; i++) {
		const pos = i * scale;
		const leftIndex = Math.floor(pos);
		const rightIndex = Math.ceil(pos);
		const t = pos - leftIndex;

		if (rightIndex >= arr.length) {
			result.push(arr[arr.length - 1]);
		} else {
			const left = arr[leftIndex];
			const right = arr[rightIndex];
			result.push(left + (right - left) * t);
		}
	}

	return result;
}

for (const element of document.querySelectorAll(".changeVisualizerButton")) {
	element.addEventListener("click", (e) => {
		currenVisualizer = Number(e.target.id);
	});
}

document.querySelector("#songPicker").addEventListener("change", (e) => {
	const file = e.target.files[0];
	if (file) {
		audioPlayer.src = URL.createObjectURL(file);
		audioCtx.resume();
		audioPlayer.play();
	}
});
