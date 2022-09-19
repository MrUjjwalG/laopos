import "./Box.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

const Box = (props) => {
  const [items, setItems] = useState([]);
  const order = props.order;
  let itemIds = [];

  const itemOrder = async (session, id) => {
    return await axios
      .post(
        "http://192.168.1.112:4000/api/itemsOrders",
        {
          crossDomain: true,
          data: {
            session: session,
            id: id,
          },
        },
        {
          timeout: 10000,
        }
      )
      .then((res) => {
        setItems(res.data);
      })
      .catch((error) => {
        itemOrder(props.session, order.orderID);
      });
  };
  useEffect(() => {
    itemOrder(props.session, order.orderID);
  }, []);

  return (
    <div className="box" style={{ backgroundColor: "rgb(0 0 0 / 16%)" }}>
      <div className="top-bar"></div>
      <div className="top">
        {/* <i className="fa fa-check-circle" aria-hidden="true"></i>
      <input type="checkbox" className="heart-btn" id="heart-btn-1"/>
      <label className="heart" htmlFor="heart-btn-1"></label> */}
      </div>
      <div className="content">
        {/* <img src={props.image} alt=""/> */}
        <strong>Order No.: {order.order}</strong>
        <strong>{order.date}</strong>
        <table>
          <thead>
            <tr>
              <th className="quantity">Qty</th>
              <th className="description">Description</th>
              <th className="price">Size</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 &&
              items.map((item, index) => {
                itemIds.push(item.invRowId);
                return (
                  <tr key={Math.random()}>
                    <td className="quantity">{item.Qty}</td>
                    <td className="description">{item.itemName}</td>
                    <td className="price">{item.pack}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="btn">
        <span style={{ textAlign: "start" }}>
          <strong>Delivered By:</strong>
          <br />
          {order.partnerName}
        </span>
        <Link
          to="#"
          className={
            order.status === "Delivered" ? "btndelivered disabled" : "btndispach disabled"
          }
        >
          {order.status === "Delivered" && "Delivered"}
          {order.status === "Picked" && "Picked"}
        </Link>
      </div>
    </div>
  );
};

export default Box;
