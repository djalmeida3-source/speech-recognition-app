import React, { useState, useEffect, useRef } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_KEY = '1ecd7b6fb8dc433ca1a2c7a80eaa8c03';
const SPEECH_REGION = 'eastus';

export function SpeechToTextComponent() {

  const [isListening, setIsListening] = useState(false);
  const speechConfig = useRef(null);
  const audioConfig = useRef(null);
  const recognizer = useRef(null);
  //text to speach
  const synthesizer = useRef(null)

  const [myTranscript, setMyTranscript] = useState("");
  const [recognizingTranscript, setRecTranscript] = useState("");

  useEffect(() => {
    speechConfig.current = sdk.SpeechConfig.fromSubscription(
      SPEECH_KEY,
      SPEECH_REGION
    );

    var autoDetectSourceLanguageConfig = sdk.AutoDetectSourceLanguageConfig.fromLanguages(["en-US", "es-ES"]);
    autoDetectSourceLanguageConfig.mode = sdk.LanguageIdMode.Continuous

    audioConfig.current = sdk.AudioConfig.fromDefaultMicrophoneInput();

    //text to speach
    synthesizer.current = new sdk.SpeechSynthesizer(speechConfig.current);

    recognizer.current = sdk.SpeechRecognizer.FromConfig(
      speechConfig.current, 
      autoDetectSourceLanguageConfig, 
      audioConfig.current
      );


    const processRecognizedTranscript = (event) => {
      const result = event.result;
      console.log('Recognition result:', result);


      if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        const transcript = result.text;
        console.log('Transcript: -->', transcript);
        // Call a function to process the transcript as needed

        setMyTranscript(transcript);
      }
    };

    const processRecognizingTranscript = (event) =>{
        const result = event.result;
        console.log('Recognition result:', result);
        if (result.reason === sdk.ResultReason.RecognizingSpeech) {
            const transcript = result.text;
            console.log('Transcript: -->', transcript);
            // Call a function to process the transcript as needed
    
            setRecTranscript(transcript);
        }
    }

    //reconoce la version final
    recognizer.current.recognized = (s, e) => processRecognizedTranscript(e);
    //reconoce la version mientras se habla
    recognizer.current.recognizing = (s, e) => processRecognizingTranscript(e);


    recognizer.current.startContinuousRecognitionAsync(() => {
      console.log('Speech recognition started.');
      setIsListening(true);
    });

    return () => {
      recognizer.current.stopContinuousRecognitionAsync(() => {
        setIsListening(false);
      });
      synthesizer.current.close();
    };
  }, []);

  const pauseListening = () => {
    setIsListening(false);
    recognizer.current.stopContinuousRecognitionAsync();
    console.log('Paused listening.');
  };

  const resumeListening = () => {
    if (!isListening) {
      setIsListening(true);
      recognizer.current.startContinuousRecognitionAsync(() => {
        console.log('Resumed listening...');
      });
    }
  };

  const stopListening = () => {
    setIsListening(false);
    recognizer.current.stopContinuousRecognitionAsync(() => {
      console.log('Speech recognition stopped.');
    });
  };


  const speakText = (text) => {
    synthesizer.current.speakTextAsync(
      text,
      result => {
        if (result) {
          console.log(`Text-to-Speech synthesis succeeded.`);
        }
        synthesizer.current.close();
        synthesizer.current = new sdk.SpeechSynthesizer(speechConfig.current);
      },
      error => {
        console.error(`Error: ${error}`);
        synthesizer.current.close();
      }
    );
  };


  return (
    <div>
      <button onClick={pauseListening}>Pause Listening</button>
      <button onClick={resumeListening}>Resume Listening</button>
      <button onClick={stopListening}>Stop Listening</button>

      <div>
        <div>
            Recognizing Transcript : {recognizingTranscript}
        </div>

        <div>
            RecognizedTranscript : {myTranscript}
        </div>

        <div>
      {/* Tus botones y visualización del transcript aquí */}
      {/* Botón adicional para probar la síntesis de voz */}
      <button onClick={() => speakText(myTranscript)}>Speak Transcript</button>
    </div>



      </div>
    </div>
  );
};