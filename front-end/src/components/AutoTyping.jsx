import React, { useState, useEffect } from "react";

const AutoTyping = () => {
  const [autoText, setAutoText] = useState("");
  const fullText = "Welcome to virtual Interview. Please click on Start interview !!";
  const typingSpeed = 50; // Adjust the speed (milliseconds per character)

  useEffect(() => {
    let currentText = "";
    let currentIndex = 0;

    const typeText = () => {
      if (currentIndex < fullText.length) {
        currentText += fullText[currentIndex];
        setAutoText(currentText);
        currentIndex++;
        setTimeout(typeText, typingSpeed);
      }
    };

    typeText();
  }, []);

  return (
    <div>
      <p>{autoText}</p>
    </div>
  );
};

export default AutoTyping;
