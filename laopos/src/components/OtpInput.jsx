import "./OtpInput.css";
import { useEffect } from "react";

const OtpInput = (props) => {
  useEffect(() => {
    document.querySelector(".error-otp").classList.remove("open");
    document.querySelector(
      "div.custom-model-wrap > div > section > div > input[type=text]:nth-child(4)"
    ).value = "";
    document.querySelector(
      "div.custom-model-wrap > div > section > div > input[type=text]:nth-child(3)"
    ).value = "";
    document.querySelector(
      "div.custom-model-wrap > div > section > div > input[type=text]:nth-child(2)"
    ).value = "";
    document.querySelector(
      "div.custom-model-wrap > div > section > div > input[type=text]:nth-child(1)"
    ).value = "";
    document
      .querySelector(
        "div.custom-model-wrap > div > section > div > input[type=text]:nth-child(1)"
      )
      .focus();
  }, [props.refresh]);

  // Collect the inputs
  const inputsList = document.querySelectorAll("input");

  // onChange setDisabledAttribute

  const isComplete = () => {
    for (const [i, inputElement] of inputsList.entries()) {
      if (inputElement.value.length === 1) {
        // setDisabledAttribute(inputsList[i]);
        inputsList[i].classList.add("paintOrangeLine");
      } else {
        inputsList[i].classList.remove("paintOrangeLine");
      }
    }
  };

  const goToNextInput = () => {
    for (const [i, inputElement] of inputsList.entries()) {
      if (inputElement.value.length === 1 && i !== 5) {
        //removeDisabledAttribute(inputsList[i + 1]);
        inputsList[i + 1].focus();
      }
      if (inputElement.value.length === 1 && i === 5) {
        inputElement.parentElement.nextElementSibling.nextElementSibling.focus();
      }
    }
  };

  const goToPrevInput = (event) => {
    var key = event.keyCode || event.charCode;
    if (key === 8 || key === 46) {
      for (const [i, inputElement] of inputsList.entries()) {
        if (inputElement.value.length === 1 && i !== 1) {
          document.querySelector(".error-otp").classList.remove("open");
          //removeDisabledAttribute(inputsList[i + 1]);
          inputsList[i].focus();
        }
      }
    }
  };

  const sendValues = async () => {
    let inputValues = [];
    for (let inputValue of inputsList) {
      if (inputValue.value.length === 1) {
        inputValues.push(inputValue.value);
      }
    }
    const otp = inputValues.join("");
    if (otp) {
      if (!(await props.submit(otp))) {
        document.querySelector(".error-otp").classList.add("open");
      }
    }
  };

  return (
    <section>
      <span className="otp-h">
        <strong>Enter OTP for Order No.: </strong>
        {props.odno}
      </span>
      <div className="container">
        <input
          className="otp-text"
          type="text"
          onChange={isComplete}
          maxLength="1"
          onInput={goToNextInput}
          onKeyUp={goToPrevInput}
          pattern="[0-9.]+"
        />
        <input
          className="otp-text"
          type="text"
          onChange={isComplete}
          maxLength="1"
          onInput={goToNextInput}
          onKeyUp={goToPrevInput}
          pattern="[0-9.]+"
        />
        <input
          className="otp-text"
          type="text"
          onChange={isComplete}
          maxLength="1"
          onInput={goToNextInput}
          onKeyUp={goToPrevInput}
          pattern="[0-9.]+"
        />
        <input
          className="otp-text"
          type="text"
          onChange={isComplete}
          maxLength="1"
          onInput={goToNextInput}
          onKeyUp={goToPrevInput}
          pattern="[0-9.]+"
        />
      </div>
      <strong className="error-otp">Wrong OTP Entered</strong>
      <button onClick={sendValues}>SUBMIT</button>
    </section>
  );
};

export default OtpInput;
