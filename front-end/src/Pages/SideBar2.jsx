import React from "react";
import "../Styles/ScreenPage.css";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VideoChat from "../components/VideoChat";
import { url } from "../Url/url";

const SideBar2 = () => {
  const toast = useToast();
  const navigate = useNavigate();

  let course = localStorage.getItem("course") || "React";

  const handleStart = () => {
    const payload = { course };
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
        .post(`${url}/chat/start?sub=${course}`, payload)
        .then((res) => console.log(res.data))
        // setAiData(res.data)
        .catch((err) => console.log(err));
    }
  };

  const handleEnd = () => {
    const payload = { logout: true };
    axios
      .post(`${url}/chat/logout`, payload)
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
    // toast({
    //   title: 'Your Interview has been Ended!!',
    //   description: "Moving towards dashboard",
    //   position: 'top',
    //   status: 'success',
    //   duration: 3000,
    //   isClosable: true,
    // })
    // setTimeout(() => {
    //   navigate("/dashboard")
    // }, 3500);
  };

  return (
    <div className="sidebar2-main-cont">
      <div>
        <div style={{backgroundColor: "white"}}>
          <VideoChat />
        </div>
        <div>
          <div className="checkbox">
            <input type="checkbox" name="" />
            <label htmlFor="">Instant Feedback</label>
          </div>
          <button onClick={handleStart}>Start the Interview</button>
          <button onClick={handleEnd}>End the Interview</button>
        </div>
      </div>
    </div>
  );
};

export default SideBar2;
