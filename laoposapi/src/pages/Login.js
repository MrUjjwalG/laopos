import "./Login.css";
import logo from "./logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const checkpass = async () => {
    return await axios
      .post("http://153.92.4.196:4000/api/getSession", {
        crossDomain: true,
        data: {
          email: document.querySelector("#email").value,
          pass: document.querySelector("#password").value,
        },
      })
      .then(({ data }) => {
        if (!data.session) {
          console.log("wrong");
          document.querySelector(".error-otp").classList.add("open");
        } else {
          localStorage.setItem("email", document.querySelector("#email").value);
          localStorage.setItem(
            "pass",
            document.querySelector("#password").value
          );
          navigate("/");
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };
  return (
    <main className="main">
      <div className="container-l">
        <section className="wrapper">
          <div className="heading">
            <img className="logo-l" src={logo} alt="" />
            <h1 className="text text-large">LAO POS</h1>
            <p className="text text-normal">
              <span>Log in to your Account</span>
            </p>
          </div>
          <div className="form">
            <div className="input-control">
              <label htmlFor="email" className="input-label" hidden>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="input-field"
                placeholder="Email Address"
              />
            </div>
            <div className="input-control">
              <label htmlFor="password" className="input-label" hidden>
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                className="input-field"
                placeholder="Password"
              />
            </div>
            <strong className="error-otp">
              Please Check Your Login Details
            </strong>

            <div className="input-control">
              <input
                type="submit"
                name="submit"
                className="input-submit"
                value="Sign In"
                onClick={checkpass}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
