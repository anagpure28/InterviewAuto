import React, { useRef, useState } from "react";
import { RiSendPlane2Fill } from "react-icons/ri";
import { Scrollbars } from "react-custom-scrollbars";
import { FaAngular, FaReact } from "react-icons/fa";
import { LiaJava } from "react-icons/lia";
import { DiNodejs } from "react-icons/di";
import TextMsg from "../components/TextMsg";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import AiMsg from "../components/AiMsg";
import { url } from "../Url/url";

const SideBar1 = () => {
  const [text, setText] = useState("");
  const [data, setData] = useState([]);
  const [aiData, setAiData] = useState([]);
  const toast = useToast();

  const inputref = useRef()
  const you = "you"
  const ai = "ai"

  const [qna, setQna]= useState([])

  let course = localStorage.getItem("course") || [];

  const handlesend = () => {
    axios
      .post(`${url}/chat/start?sub=${course}`)
      .then((res) => {
        console.log(res.data);
        setAiData(res.data);
      })
      .catch((err) => console.log(err));
  }

  // const handleClick = () => {
  //   const newText = {
  //     id: Date.now(),
  //     title: text,
  //   };
  //   axios
  //     .post(`${url}/chat/submit`, newText)
  //     .then((res) => {
  //       console.log(res.data);
  //       setAiData(res.data);
  //     })
  //     .catch((err) => console.log(err));
  //   if (newText.title == "") {
  //     toast({
  //       title: "Please write something",
  //       position: "top",
  //       status: "warning",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } else {
  //     setData([...data, newText]);
  //     console.log(data);
  //     setText("");
  //   }
  //   // console.log(text)
  // };

  return (
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
              <p>Hello! Are you ready for the interview?</p>
              
              <div>
                {data?.map((el, i) => {
                  return (
                    <div key={i}>
                      <TextMsg {...el} />
                    </div>
                  );
                })}
              </div>
              <div>
                {aiData}
              </div>
            </div>
          </Scrollbars>
        </div>
        <div className="screen-input-div">
          <input
            type="text"
            placeholder="send a message"
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handleClick}>
            <RiSendPlane2Fill
              style={{ marginLeft: "1rem", fontSize: "25px", color: "grey" }}
            />
          </button>
        </div>
        <button onClick={handlesend}>handle</button>
      </div>
    </div>
  );
};

export default SideBar1;
