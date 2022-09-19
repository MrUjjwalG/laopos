import "./NoOrder.css";
const NoOrder = (props) => {
  return (
    <div className="no-order">
      <p class="loading-text">{props.msg}</p>
      <lottie-player
        className="lplayer"
        src="https://assets1.lottiefiles.com/packages/lf20_s9lvjg2e.json"
        background="transparent"
        speed="1"
        style={{ height: "70vh" }}
        loop
        autoplay
      ></lottie-player>
    </div>
  );
};

export default NoOrder;
