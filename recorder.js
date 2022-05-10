Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/

});

Qualtrics.SurveyEngine.addOnReady(function()
{
	
	// disable next button before a recording is submitted
	this.disableNextButton();
	// save a reference to the qualtrics QuestionData obj
	var question = this;
	
	// webkitURL is deprecated but nevertheless
	URL = window.URL || window.webkitURL;

	var gumStream; 						// stream from getUserMedia()
	var rec; 							// Recorder.js object
	var input; 							// MediaStreamAudioSourceNode we'll be recording

	// shim for AudioContext when it's not avb. 
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioContext // audio context to help us record

	var recordButton = document.getElementById("recordButton");
	var pauseButton = document.getElementById("pauseButton");
	var submitButton = document.getElementById("submitButton");
	var blobHolder = undefined;
	var paused = false;

	// add events to those 3 buttons
	recordButton.addEventListener("click", startRecording);
	pauseButton.addEventListener("click", pauseRecording);
	submitButton.addEventListener("click", sendRequest);
	
	recordButton.disabled = false;
	pauseButton.disabled = true;
	submitButton.disabled = true;

	function startRecording() {
		console.log("recordButton clicked");

		/*
			Simple constraints object, for more advanced audio features see
			https://addpipe.com/blog/audio-constraints-getusermedia/
		*/

		var constraints = { audio: true, video: false }

		/*
			Disable the record button until we get a success or fail from getUserMedia() 
		*/

		recordButton.disabled = true;
		pauseButton.disabled = false;
		recordButton.innerHTML = "Recording...";
		pauseButton.innerHTML = "Pause";
		paused = false;

		/*
			We're using the standard promise based getUserMedia() 
			https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
		*/

		navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
			console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

			/*
				create an audio context after getUserMedia is called
				sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
				the sampleRate defaults to the one set in your OS for your playback device
			*/
			audioContext = new AudioContext();

			//update the format 
			// document.getElementById("formats").innerHTML="Format: 1 channel pcm @ "+audioContext.sampleRate/1000+"kHz"

			/*  assign to gumStream for later use  */
			gumStream = stream;

			/* use the stream */
			input = audioContext.createMediaStreamSource(stream);

			/* 
				Create the Recorder object and configure to record mono sound (1 channel)
				Recording 2 channels  will double the file size
			*/
			rec = new Recorder(input,{numChannels:1});

			// start the recording process
			rec.record();

			console.log("Recording started");
			
			const sentences = ['Do you hear the sleigh bells ringing?',
				 "Masquerade parties tax one's imagination.",
				 'Although always alone, we survive.',
				 'I honor my mom.',
				 "Jeff's toy go-cart never worked!",
				 'Allow leeway here.',
				 'Did dad do academic bidding?',
				 'The oasis was a mirage.',
				 'Is this seesaw safe?',
				 'Which church do the Smiths worship in?',
				 'I took her word for it.',
				 'Rationalize all errors.',
				 'Is she going with you?',
				 'This was easy for us.',
				 'He will allow a rare lie.',
				 'They enjoy it when I audition.',
				 'Who took the kayak down the bayou?',
				 'How do oysters make pearls?',
				 'The meeting is now adjourned.',
				 'Where were you while we were away?',
				 'A good attitude is unbeatable.',
				 'How good is your endurance?',
				 'They all like long hot showers.',
				 'Those thieves stole thirty jewels.',
				 'Tina Turner is a pop singer.',
				 "Take a quick break—you're going to be asked to read each sentence again"];
			const readTime = 4000;
			const numSteps = 200;
			const stepSize = readTime / numSteps;
			const numReps = 3;
			const numTotal = sentences.length * numSteps * numReps;
			var sentInd = 0;
			var timeCount = numSteps + 1;
			var rep = 0;
			var progPoints = 0;
			document.getElementById("timer-bar").style.width = "0%";
			document.getElementById("prog-bar").style.width = "0%";
			
			var x = setInterval(function() {
				if (!paused) {
					if (timeCount > numSteps) {
						document.getElementById("sen").innerHTML = sentences[sentInd];
						sentInd += 1;
						if (sentInd >= sentences.length) {
							sentInd = 0;
							rep += 1;
						}
						timeCount = 1;
					}
					else
					{
						timeCount += 1;
					}
					progPoints += 1;

					document.getElementById("timer-bar").style.width = "" + (timeCount / numSteps * 100) + "%";
					document.getElementById("prog-bar").style.width = "" + (progPoints / numTotal * 100) + "%";

					// If the count down is finished, write some text
					if (rep >= numReps) {
						clearInterval(x);
						document.getElementById("sen").innerHTML = 'Recording finished—press "submit" to continue.';
						document.getElementById("timer-bar").style.width = "100%";
						document.getElementById("prog-bar").style.width = "100%";
						endRecording();
					}
				}
			}, stepSize);
		}).catch(function(err) {
			console.log(err);
			// enable the record button if getUserMedia() fails
			recordButton.disabled = false;
		});
	}
	
	function pauseRecording() {
		console.log("pauseButton clicked");

		if (paused) {
			pauseButton.innerHTML = "Pause";
			rec.record();
			paused = false;
		}
		else
		{
			pauseButton.innerHTML = "Resume";
			rec.stop();
			paused = true;
		}
	}

	function endRecording() {
		
		// tell the recorder to stop the recording
		rec.stop();

		// stop microphone access
		gumStream.getAudioTracks()[0].stop();

		// create the wav blob and pass it on to createBlobLink
		rec.exportWAV(createBlobLink);

		// clear recorder
		rec.clear();
		
		pauseButton.disabled = true;
		submitButton.disabled = false;
		recordButton.innerHTML = 'Recording finished';
	}

	function createBlobLink(blob) {
		console.log("creating playback");
		console.log("blob: ", blob);

		var url = URL.createObjectURL(blob);

		// blobHolder holds the last blob recorded, which will be sent
		blobHolder = blob;
	}
	
	function sendRequest() {
		console.log("sending request...");

		// create request and send blob to ocf server
		var xhr = new XMLHttpRequest();
		xhr.onload = function(e) {
		  if (this.readyState === 4) {
			  console.log("Server returned: ", e.target.responseText);
		  }
		};
		
		var fd = new FormData();
		var filename = "${e://Field/random_id}";
		
		console.log("submit blob: ", blobHolder);
		fd.append("audio_data", blobHolder, filename);
		xhr.open("POST", "YOUR_SERVER_ADDRESS", true);
		xhr.send(fd);
		
		//sendRequest();
		// enable next button
		submitButton.disabled = true;
		question.enableNextButton();
	}
});

/*Qualtrics.SurveyEngine.addOnPageSubmit(function(type){
	sendRequest();
});*/

Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/
});