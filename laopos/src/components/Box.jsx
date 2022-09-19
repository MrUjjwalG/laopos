import "./Box.css"
import {
    Link
  } from "react-router-dom";


const Box = (props) => {
  return (
    <div className="box">
    <div className="top-bar"></div>
    <div className="top">
      {/* <i className="fa fa-check-circle" aria-hidden="true"></i>
      <input type="checkbox" className="heart-btn" id="heart-btn-1"/>
      <label className="heart" htmlFor="heart-btn-1"></label> */}
    </div>
    <div className="content">
      {/* <img src={props.image} alt=""/> */}
      <strong>Order : {props.name}</strong>
      <p>LAOAPP</p>
    </div>
    <div className="btn">
      <Link to="#" className="btnaccept"><i className="fa fa-solid fa-check" aria-hidden="true"></i>Accept</Link>
      <Link to="#" className="btnreject"><i className="fa fa-solid fa-xmark" aria-hidden="true"></i>Reject</Link>
    </div>
  </div>
  )
}

export default Box