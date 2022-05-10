Qualtrics.SurveyEngine.addOnload(function()
{
	/*Place your JavaScript here to run when the page loads*/

});

Qualtrics.SurveyEngine.addOnReady(function()
{
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
	var stopButton = document.getElementById("stopButton");
	var sen = document.getElementById("sen");
	var au = document.getElementById("playback");
	var blobHolder = undefined;
	var stopped = false;

	// add events to those 3 buttons
	recordButton.addEventListener("click", startRecording);
	stopButton.addEventListener("click", stopRecording);
	
	recordButton.disabled = false;
	stopButton.disabled = true;

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
		stopButton.disabled = false;
		stopped = false;
		stopButton.innerHTML = "Stop";

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
			sen.innerHTML = "Recording...";
			rec.record();

			console.log("Recording started");
		}).catch(function(err) {
			console.log(err);
			// enable the record button if getUserMedia() fails
			recordButton.disabled = false;
		});
	}
	
	function stopRecording() {
		console.log("stopButton clicked");

		if (stopped) {
			startRecording();
		}
		else
		{
			stopButton.innerHTML = "Re-record";
			sen.innerHTML = "Recording paused";
			rec.stop();
			gumStream.getAudioTracks()[0].stop();
			rec.exportWAV(createBlobLink);
			rec.clear();
			stopped = true;
		}
	}
	
	function createBlobLink(blob) {
		console.log("creating playback");
		console.log("blob: ", blob);

		var url = URL.createObjectURL(blob);

		// set audio source to new blob
		au.src = url;

		// blobHolder holds the last blob recorded, which will be sent
		blobHolder = blob;
	}
});


Qualtrics.SurveyEngine.addOnUnload(function()
{
	/*Place your JavaScript here to run when the page is unloaded*/
});