import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Input } from "antd";
import { AudioOutlined } from "@ant-design/icons";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Speech from "speak-tts";

const { Search } = Input;

const DOMAIN = process.env.REACT_APP_DOMAIN;

const searchContainer = {
    display: "flex",
    justifyContent: "center"
};

const ChatComponent = (props) => {
    const { handleResp, isLoading, setIsLoading } = props;
    // Define a state variable to keep track of the search value
    const [searchValue, setSearchValue] = useState("");
    const [isChatModeOn, setIsChatModeOn] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [speech, setSpeech] = useState();

      // speech recognation
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable,
    } = useSpeechRecognition();

    useEffect(() => {
        const speech = new Speech();
        speech
            .init({
                volume: 1,
                lang: "en-US",
                rate: 1,
                pitch: 1,
                voice: "Google US English",
                splitSentences: true,
            })
            .then((data) => {
                // The "data" object contains the list of available voices and the voice synthesis params
                console.log("Speech is ready, voices are available", data);
                setSpeech(speech);
            })
            .catch((e) => {
                console.error("An error occured while initializing : ", e);
            });
    }, []);

    useEffect(() => {
        if (!listening && !!transcript) {
            (async () => await onSearch(transcript))();
            setIsRecording(false);
        }
    }, [listening, transcript]);
    
    const talk = (what2say) => {
    speech
        .speak({
            text: what2say,
            queue: false, // current speech will be interrupted,
            listeners: {
                onstart: () => {
                console.log("Start utterance");
                },
                onend: () => {
                console.log("End utterance");
                },
                onresume: () => {
                console.log("Resume utterance");
                },
                onboundary: (event) => {
                console.log(
                    event.name +
                    " boundary reached after " +
                    event.elapsedTime +
                    " milliseconds."
                );
                },
            },
        })
        .then(() => {
            // if everyting went well, start listening again
            console.log("Success !");
            userStartConvo();
        })
        .catch((e) => {
            console.error("An error occurred :", e);
        });
    };

    const userStartConvo = () => {
        SpeechRecognition.startListening();
        setIsRecording(true);
        resetEverything();
        };

    const resetEverything = () => {
        resetTranscript();
    };

    const chatModeClickHandler = () => {
        setIsChatModeOn(!isChatModeOn);
        setIsRecording(false);
        SpeechRecognition.stopListening();
    };

    const recordingClickHandler = () => {
        if (isRecording) {
            setIsRecording(false);
            SpeechRecognition.stopListening();
        } else {
            setIsRecording(true);
            SpeechRecognition.startListening();
        }
    };    

    const onSearch = async (question) => {
        setSearchValue("");
        setIsLoading(true);

        try {
            const response = await axios.get(`${DOMAIN}/chat`, {
                params: {
                    question
                }
            });

            handleResp(question, response.data);
            if (isChatModeOn) {
                talk(response.data);
            }        
        } catch (error) {
            handleResp(question, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setSearchValue(e.target.value);
    };

return <div style={{searchContainer}}>
    {!isChatModeOn && (
        <Search
            style={{ marginTop: "-50px",}}
            placeholder="Ask me something"
            enterButton={
                <button
                    style={{
                        backgroundColor: "black", 
                        color: "White",            
                        border: "none",            
                        padding: "12px 15px",       
                        borderRadius: "1px",
                        cursor: "pointer"
                    }}
                >Ask</button>
            }
            size="large"
            onSearch={onSearch}
            loading={isLoading}
            value={searchValue}
            onChange={handleChange}
        />
    )}
        <Button
            type="primary"
            size="large"
            danger={isChatModeOn}
            onClick={chatModeClickHandler}
            style={{
                marginTop: "-100px",
                backgroundColor: "black",
                color: "white",
                border: "none",
                marginLeft: "0px",
                height: "40px",
                alignSelf: "center"
            }}
        >
            Chat Mode: {isChatModeOn ? "On" : "Off"}
        </Button>
        {isChatModeOn && (
            <Button
                type="primary"
                icon={<AudioOutlined />}
                size="large"
                danger={isRecording}
                onClick={recordingClickHandler}
                style={{
                    backgroundColor: isRecording ? "red" : "black",
                    color: "white",
                    border: "none",
                    marginLeft: "0px",
                    height: "40px",
                    alignSelf: "center"
                }}
            >
                {isRecording ? "Recording..." : "Click to record"}
            </Button>
        )}
    </div>
}

export default ChatComponent;