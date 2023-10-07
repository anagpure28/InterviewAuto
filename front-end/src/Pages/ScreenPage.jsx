import React, { useCallback, useEffect, useRef, useState } from "react";
import "../Styles/ScreenPage.css";
// import SideBar1 from "./SideBar1";
import SideBar2 from "./SideBar2";
import { RiSendPlane2Fill } from "react-icons/ri";
import { Scrollbars } from "react-custom-scrollbars-2";
import { FaAngular, FaReact } from "react-icons/fa";
import { LiaJava } from "react-icons/lia";
import { DiNodejs } from "react-icons/di";
import { BsFillMicFill } from "react-icons/bs";
import { BsFillMicMuteFill } from "react-icons/bs";
import TextMsg from "../components/TextMsg";
import { Box, SkeletonCircle, SkeletonText, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import boy from "../Images/boy.jpg";
import VideoChat from "../components/VideoChat";
import { url } from "../Url/url.js";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import AutoTyping from "../components/AutoTyping";
// import { useReactMediaRecorder } from "react-media-recorder";

const ScreenPage = () => {
  const [text, setText] = useState("");
  const [data, setData] = useState([]);
  const [aiData, setAiData] = useState([]);
  const [instantFeedback, setInstantFeedback] = useState(false);
  // console.log(instantFeedback)
  const navigate = useNavigate();
  const toast = useToast();

  // const {
  //   status,
  //   startRecording,
  //   stopRecording,
  //   mediaBlobUrl
  // } = useReactMediaRecorder({ video: true });
  // localStorage.setItem("video", mediaBlobUrl);

  // Copy to ClipBoard
  // const [textToCopy, setTextToCopy] = useState("");
  // const [isCopied, setCopied] = useClipboard(textToCopy, {
  //   successDuration: 1000,
  // });

  // Editable transcript
  const [editedTranscript, setEditedTranscript] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const inputref = useRef();
  const instantRef = useRef();
  const you = "you";
  const ai = "ai";

  const [response, setResponse] = useState([]);

  let course = localStorage.getItem("course") || "Interview";

  const updateResponse = (from, value) => {
    setResponse((response) => [...response, { from, value }]);
  };

  const handleStart = () => {
    if (!course) {
      toast({
        title: "Select select course first",
        position: "top",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } else {
      axios
        .post(`${url}/chat/start?sub=${course}`)
        .then((res) => {
          console.log(res.data);
          setAiData(res.data);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleSubmit = () => {
    const newText = inputref.current.value;
    const checked = instantRef.current.value;
    if (newText === "") {
      return toast({
        title: "Please write something",
        position: "top",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
    updateResponse(you, newText);
    console.log(checked);

    if (!instantFeedback) {
      axios
        .post(`${url}/chat/submit?feedback=0`, newText)
        .then((res) => {
          console.log(res.data);
          updateResponse(ai, res.data);
          inputref.current.value = "";
        })
        .catch((err) => console.log(err));
      if (newText == "") {
        toast({
          title: "Please write something",
          position: "top",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setData([...data, newText]);
        setText(text ? "" : reset());
      }
    } else {
      axios
        .post(`${url}/chat/submit?feedback=1`, newText)
        .then((res) => {
          console.log(res.data);
          updateResponse(ai, res.data);
          inputref.current.value = "";
        })
        .catch((err) => console.log(err));
      if (newText == "") {
        toast({
          title: "Please write something",
          position: "top",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setData([...data, newText]);
        setText(text ? "" : reset());
      }
    }
  };

  const renderContent = (response) => {
    const value = response.value;
    if (Array.isArray(value)) {
      return value?.map((el, i) => {
        return { el };
      });
    }
    inputref.current.value = "";
    return <p>{value}</p>;
  };

  const handleEnd = () => {
    const payload = { logout: true };
    axios
      .post(`${url}/chat/logout`, payload)
      .then((res) => {
        console.log(res.data);
        localStorage.setItem("final-data", JSON.stringify(res.data));
      })
      .catch((err) => console.log(err));
    toast({
      title: "Your Interview has been Ended!!",
      description: "Moving towards dashboard",
      position: "top",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setTimeout(() => {
      navigate("/dashboard");
    }, 3500);
  };

  useEffect(()=> {
    const handleClick = (e) => {
      e.preventDefault();
      alert('Pasting is not allowed.');
    }

    document.addEventListener('paste', handleClick);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('paste', handleClick);
    };
  },[])

  // const [count, setcount] = useState(0)

  // // Tab Warning on change
  // useEffect(()=> {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === "visible") {
  //       console.log("tab is active");
  //     } else {
  //       setcount((count)=> count + 1);
  //     }
  //   };

  //   // Add a visibilitychange event listener to the document
  //   document.addEventListener("visibilitychange", handleVisibilityChange);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //   };
  // },[])

  // if(count==1){
  //   // alert("You have changed the tab. 2 chances are remaining");
  //   toast({
  //     title: "You are not allowed to Move out from the Exam window",
  //     description: "Warning / Alert No. 1",
  //     position: "top",
  //     status: "warning",
  //     duration: 5000,
  //     isClosable: true,
  //   });
  // }else if(count==2){
  //   // alert("You have changed the tab twice. This is final warning.");
  //   toast({
  //     title: "This is last warning else you will be terminated",
  //     description: "Warning / Alert No. 2",
  //     position: "top",
  //     status: "error",
  //     duration: 5000,
  //     isClosable: true,
  //   });
  // }else if(count==3){
  //   handleEnd(
  //     setTimeout(() => {
  //       navigate("/dashboard");
  //    }, 3500)
  //   )
  // }

  // Start Listening
  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  // Edit the transcript
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTranscript(transcript);
  };

  // Save edited transcript
  const handleSave = () => {
    setIsEditing(false);
    // setTextToCopy(editedTranscript);
    setText(editedTranscript);
    resetTranscript(editedTranscript);
  };

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  function reset() {
    return resetTranscript;
  }

  return (
    <div className="screen-main-cont">
      <div className="animate__animated animate__backInDown">
        <p style={{ zIndex: "100" }}>Welcome to {course} Session</p>
      </div>
      <div>
        <div>
          <div className="sidebar1-main-cont">
            <div>
              <div>
                {course === "React" ? (
                  <FaReact className="seticon" style={{ color: "#7ddfff" }} />
                ) : course === "Java" ? (
                  <LiaJava
                    className="seticon"
                    style={{ color: "white", fontSize: "80px" }}
                  />
                ) : course === "Node" ? (
                  <DiNodejs
                    className="seticon"
                    style={{ color: "#43c22b", fontSize: "115px" }}
                  />
                ) : course === "Angular" ? (
                  <FaAngular className="seticon" style={{ color: "red" }} />
                ) : (
                  ""
                )}
              </div>
              <div className="img-div">
                <img
                  src="https://www.shutterstock.com/shutterstock/videos/1063759960/thumb/6.jpg?ip=x480"
                  alt=""
                  style={{ width: "150%", height: "55%" }}
                />
              </div>
            </div>
            <div>
              <div>
                <Scrollbars>
                  <div className="scroll-div">
                    <p
                      style={{
                        margin: "10px auto auto 47.5px",
                        fontSize: "1.2rem",
                      }}
                    >
                      <AutoTyping />
                    </p>
                    {aiData?.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          marginTop: "15px",
                          width: "100%",
                        }}
                      >
                        <div style={{ width: "7%" }}>
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              marginRight: "10px",
                              borderRadius: "50%",
                              border: "2px solid orange",
                            }}
                          >
                            <img
                              src="https://previews.123rf.com/images/goodzone95/goodzone951803/goodzone95180300023/96668201-chatbot-icon-cute-robot-working-behind-laptop-modern-bot-sign-design-smiling-customer-service.jpg"
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ width: "93%" }}>
                          <ol
                            style={{
                              color: "white",
                              marginTop: "3px",
                              fontSize: "1.1rem",
                              width: "100%",
                            }}
                          >
                            <li>{aiData}</li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="waitingTime">
                        <p>
                          Please wait for few seconds <br />
                          Your interview will start soon...
                        </p>
                        <span className="loader"></span>
                      </div>
                    )}
                    {response.map((el, i) => {
                      if (el.from == you) {
                        return (
                          <div
                            style={{
                              display: "flex",
                              marginTop: "5px",
                              width: "100%",
                            }}
                          >
                            <div style={{ width: "7%" }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  marginTop: "-2px",
                                  marginRight: "10px",
                                  borderRadius: "50%",
                                  border: "2px solid green",
                                }}
                              >
                                <img
                                  src={boy}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ width: "93%", marginTop: "-2px" }}>
                              <ol
                                style={{
                                  color: "white",
                                  marginTop: "3px",
                                  fontSize: "1.1rem",
                                  width: "100%",
                                }}
                              >
                                <li>{renderContent(el)}</li>
                              </ol>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            style={{
                              display: "flex",
                              marginTop: "30px",
                              width: "100%",
                            }}
                          >
                            <div style={{ width: "7%" }}>
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  marginRight: "10px",
                                  borderRadius: "50%",
                                  border: "2px solid orange",
                                }}
                              >
                                <img
                                  src="https://previews.123rf.com/images/goodzone95/goodzone951803/goodzone95180300023/96668201-chatbot-icon-cute-robot-working-behind-laptop-modern-bot-sign-design-smiling-customer-service.jpg"
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "50%",
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ width: "93%" }}>
                              <ol
                                style={{
                                  color: "white",
                                  marginTop: "3px",
                                  fontSize: "1.1rem",
                                  width: "100%",
                                }}
                              >
                                <li>{renderContent(el)}</li>
                              </ol>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </Scrollbars>
              </div>
              <div className="screen-input-div">
                {isEditing ? (
                  <input
                    id="edit"
                    ref={inputref}
                    type="text"
                    placeholder="send a message"
                    name="text"
                    value={editedTranscript ? editedTranscript : text}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                  />
                ) : (
                  <input
                    id="inputText"
                    ref={inputref}
                    type="text"
                    placeholder="send a message"
                    name="text"
                    value={transcript ? transcript : text}
                    onChange={(e) => setText(e.target.value)}
                    onClick={handleEdit}
                  />
                )}
                <div className="screen-input-flex-button">
                  {isEditing ? (
                    <button onClick={handleSave}>Save</button>
                  ) : (
                    <button className="submitButton" onClick={handleSubmit}>
                      <RiSendPlane2Fill
                        style={{
                          marginLeft: "1rem",
                          fontSize: "25px",
                          color: "grey",
                        }}
                      />
                    </button>
                  )}
                  <button className="mic" onClick={startListening}>
                    <BsFillMicFill />
                  </button>
                  <button
                    className="mic2"
                    onClick={SpeechRecognition.stopListening}
                  >
                    <BsFillMicMuteFill />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="sidebar2-main-cont">
            <div>
              <VideoChat />
              <div>
                <div className="checkbox">
                  <input
                    ref={instantRef}
                    type="checkbox"
                    name=""
                    value={instantFeedback}
                    onChange={(e) => setInstantFeedback(e.target.checked)}
                  />
                  <label htmlFor="">Instant Feedback</label>
                </div>
                <button className="start" onClick={handleStart}>
                  Start the Interview
                </button>
                <button className="end" onClick={handleEnd}>
                  End the Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenPage;
