# Qualtrics Embedded Recorder

This repository contains code to embed a recorder in a Qualtrics survey to
record speaker audio for sociolinguistic experiments. It is based on
[this recorder by Cynthia Zhong](https://github.com/cynthiazz/recorder-embed),
which is in turn based on [this tutorial by Pipe](https://blog.addpipe.com/using-recorder-js-to-capture-wav-audio-in-your-html5-web-site/) and uses
[Recorder.js by Matt Diamond](https://github.com/mattdiamond/Recorderjs).

The recorder will prompt speakers with a series of sentences, giving them a
fixed amount of time to read each sentence aloud before moving on to the next
one. The main difference between this recorder and Cynthia's is that this
recorder will project all sentences sequentially, recording one long audio file,
and not giving the speaker the opportunity to manually re-record. This recorder
also introduces two progress bars so that speakers can keep track of how long
they have to read each sentence and how far they are in the total task.

Because speakers are not given the opportunity to listen to or re-record any of
their audio manually, this repository also contains code for a step where they
can test-record audio to callibrate their quality. They are also tasked to read
the complete list of sentences three times through, in case of any mistakes or
disruptions that occur while they're reading.

## How to use

1. Create your new Qualtrics survey, and wherever you want to the recorder to
appear add a new question of type "Text/Graphic." Copy the code from
`recorder.html` into the body of that question, and then copy the code from
`recorder.js` as the JavaScript for that question

2. You can do the same with `tester.html` and `tester.js` earlier in the survey
to add a step for speakers to calibrate their recording environemnt

3. Go to "Look and Feel" on the left-hand side of your survey builder, then go
to "Style" and copy the code from `recorder.css` into the "Custom CSS" box

4. Add `upload.php` to your remote server—this is the script that will recieve
audio files as they are recorded by the survey

## Customizing

There's a couple ways you may wish to customize the behavior of this recorder:

* To customize the list of sentences for speakers to read, you can edit the
`sentences` constant in `recorder.js`

* To customize the amount of time speakers get to read each sentence, you can
edit the `readTime` constant in `recorder.js` (this is time in milliseconds)

## Tips/Recommendations

There's also a couple of things I ran into that I think are good to note for
anyone using this recorder:

* If you want to use the setup instructions I gave speakers, they're in
`speaker_instructions.txt`—I put this text right above the test recorder

* I recommend adding a path where speakers can opt to have more time per
sentence—I got feedback from a speaker who turned out to be dyslexic, and I
was unable to use his recordings because he wasn't able to read the sentences at
the pace they were coming. After this happened, I added a branch to my survey
where speakers could either opt to take either four seconds per sentence or six
seconds per sentence, and would be redirected to a different recorder block as
appropriate