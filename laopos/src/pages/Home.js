import "./Home.css";
import logo from "./logo.png";
import ring from "./ring.wav";
import BoxFresh from "../components/BoxFresh";
import BoxAccepted from "../components/BoxAccepted";
import BoxReady from "../components/BoxReady";
import BoxDeliverd from "../components/BoxDeliverd";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import _ from "underscore";
import useSound from "use-sound";
import axios from "axios";
import NoOrder from "../components/NoOrder";
import OtpInput from "../components/OtpInput";
import { useNavigate } from "react-router-dom";
const Home = () => {
  let { type } = useParams();
  const [play, { stop }] = useSound(ring);
  const navigate = useNavigate();

  if (!(localStorage.getItem("email") && localStorage.getItem("pass"))) {
    navigate("/login");
  }

  const logout = () => {
    localStorage.clear();
    stop();
    navigate("/login");
  };

  const getShop = async (session) => {
    return await axios
      .post(
        "http://153.92.4.196:4000/api/getShop",
        {
          crossDomain: true,
          data: {
            session: session,
          },
        },
        {
          timeout: 10000,
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log("error", error);
        return null;
      });
  };

  const getSession = async (email, pass) => {
    return await axios
      .post("http://153.92.4.196:4000/api/getSession", {
        crossDomain: true,
        data: {
          email: email,
          pass: pass,
        },
      })
      .then(({ data }) => {
        return data.session;
      })
      .catch((error) => {
        console.log("error", error);
        return "";
      });
  };

  const changeShop = async () => {
    const sess = await getSessionID();
    return await axios
      .post(
        "http://153.92.4.196:4000/api/setShop",
        {
          crossDomain: true,
          data: {
            session: sess,
          },
        },
        {
          timeout: 10000,
        }
      )
      .then((res) => {
        document.querySelector("#switch").checked = res.data.status;
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const dispatch = async (odr, dboy, rowid) => {
    const sess = await getSessionID();

    return await axios
      .post(
        "http://153.92.4.196:4000/api/sentOtp",
        {
          crossDomain: true,
          data: {
            session: sess,
            dboy: dboy,
            rowid: rowid,
          },
        },
        {
          timeout: 20000,
        }
      )
      .then((res) => {
        setDispstchNo(odr);
        setOtp((prev) => prev + 1);
        document
          .querySelector("div.custom-model-main")
          .classList.add("model-open");
        setLastOtp(res.data);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const dispatchOtp = async (otp) => {
    const data = JSON.parse(lastotp);

    const sess = await getSessionID();
    return await axios
      .post(
        "http://153.92.4.196:4000/api/submitOtp",
        {
          crossDomain: true,
          data: {
            session: sess,
            uid: data.usrid,
            otp: otp,
            odno: data.orderno,
            mob: data.mobile,
          },
        },
        {
          timeout: 20000,
        }
      )
      .then((res) => {
        if (JSON.parse(res.data).submit) {
          document
            .querySelector("div.custom-model-main")
            .classList.remove("model-open");
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const getfreshOrders = async (session) => {
    return await axios
      .post(
        "http://153.92.4.196:4000/api/freshOrders",
        {
          crossDomain: true,
          data: {
            session: session,
          },
        },
        {
          timeout: 10000,
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log("error", error);
        return null;
      });
  };

  const getacceptedOrders = async (session) => {
    return await axios
      .post(
        "http://153.92.4.196:4000/api/acceptedOrders",
        {
          crossDomain: true,
          data: {
            session: session,
          },
        },
        {
          timeout: 20000,
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log("error", error);
        return null;
      });
  };

  const getreadyOrders = async (session) => {
    return await axios
      .post(
        "http://153.92.4.196:4000/api/readyOrders",
        {
          crossDomain: true,
          data: {
            session: session,
          },
        },
        {
          timeout: 10000,
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log("error", error);
        return null;
      });
  };

  const getdeliveredOrders = async (session) => {
    return await axios
      .post(
        "http://153.92.4.196:4000/api/deliveredOrders",
        {
          crossDomain: true,
          data: {
            session: session,
          },
        },
        {
          timeout: 10000,
        }
      )
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log("error", error);
        return null;
      });
  };

  const [count, setCount] = useState([]),
    [fresh, setFresh] = useState([]),
    [accepted, setAccepted] = useState([]),
    [ready, setReady] = useState([]),
    [delivered, setDelivered] = useState([]),
    [otp, setOtp] = useState(0),
    [lastotp, setLastOtp] = useState({}),
    [dispstchNo, setDispstchNo] = useState(""),
    [sessionID, setSessionID] = useState(""),
    [toggle, setToggle] = useState(true);

  const removeDuplicates = (list, funck, stat) => {
    let items = [];
    list.map((Order) => {
      const item = {
        odno: Order.props.order.order,
        status: Order.props.order.status,
        index: list.indexOf(Order),
      };
      const index = items.findIndex((x) => x.odno === Order.props.order.order);
      if (index >= 0) {
        if (stat) {
          if (items[index].status === stat) {
            list.splice(items[index].index, 1);
            funck(list);
          } else {
            list.splice(list.indexOf(Order), 1);
            funck(list);
          }
        } else {
          list.splice(items[index].index, 1);
          funck(list);
        }
      } else {
        items.push(item);
      }
      return true;
    });
  };

  const removeUnnecessary = (list, list2, funck) => {
    list.forEach((Order) => {
      const index = list2.findIndex(
        (x) => x.props.order.order === Order.props.order.order
      );
      if (index >= 0) {
        list2.splice(index, 1);
        funck(list2);
      }
    });
  };

  const removeOrder = (list, obj, funck) => {
    list.forEach((Order) => {
      // console.log(Order.props.order.order, obj.order);
      // const index = list.findIndex((x) => x.props.order.order === obj.order);
      // if (index >= 0) {
      //   console.log(obj.order);
      //   list.splice(index, 1);
      //   funck(list);
      // }
    });
  };

  const getSessionID = async () => {
    if (sessionID === "" || sessionID === null) {
      const sid = await getSession(
        localStorage.getItem("email"),
        localStorage.getItem("pass")
      );
      setSessionID(sid);
      return sid;
    } else {
      return sessionID;
    }
  };

  const findInOrders = (objs, obj) => {
    const result = _.find(objs, function (o) {
      return _.isEqual(o.props.order, obj);
    });

    if (result) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const getFresh = async () => {
      let freshOrders;
      let odf = [...fresh];
      const sess = await getSessionID();

      freshOrders = JSON.parse(await getfreshOrders(sess));
      if (freshOrders != null && freshOrders.length > 0) {
        play();
        const requests = freshOrders.map((freshOrder) => {
          if (!findInOrders(odf, freshOrder.order)) {
            odf.push(
              <BoxFresh
                key={Math.random()}
                order={freshOrder.order}
                reload={async () => {
                  await getAccepted();
                  await getFresh();
                }}
                session={sess}
              />
            );
            setFresh(odf);
          }
          return true;
        });
        return Promise.all(requests).then(() => {
          removeDuplicates(odf, setFresh);
        });
      } else if (freshOrders != null && freshOrders.order === 0) {
        setFresh([]);
      }
    };

    const getAccepted = async () => {
      let acceptedOrders;
      let oda = [...accepted];
      const sess = await getSessionID();

      acceptedOrders = JSON.parse(await getacceptedOrders(sess));
      if (acceptedOrders != null && acceptedOrders.length > 0) {
        const requests = acceptedOrders.map((acceptedOrder) => {
          if (acceptedOrder.order && !findInOrders(oda, acceptedOrder.order)) {
            removeOrder(fresh, acceptedOrder.order, setFresh);
            oda.push(
              <BoxAccepted
                key={Math.random()}
                order={acceptedOrder.order}
                reload={async () => {
                  await getReady();
                  await getAccepted();
                }}
                session={sess}
              />
            );
            setAccepted(oda);
          }
          return true;
        });

        return Promise.all(requests).then(() => {
          removeDuplicates(oda, setAccepted);
          removeUnnecessary(oda, fresh, setFresh);
        });
      } else if (acceptedOrders != null && acceptedOrders.order === 0) {
        setAccepted([]);
      }
    };

    const getReady = async () => {
      let readyOrders;
      let odr = [...ready];
      const sess = await getSessionID();

      readyOrders = JSON.parse(await getreadyOrders(sess));
      if (readyOrders != null && readyOrders.length > 0) {
        const requests = readyOrders.map((readyOrder) => {
          if (!findInOrders(odr, readyOrder.order)) {
            removeOrder(accepted, readyOrder.order, setAccepted);
            odr.push(
              <BoxReady
                key={Math.random()}
                order={readyOrder.order}
                submit={dispatch}
                session={sess}
              />
            );
            setReady(odr);
          }
          return true;
        });

        return Promise.all(requests).then(() => {
          removeDuplicates(odr, setReady, "Pending");
          removeUnnecessary(odr, accepted, setAccepted);
        });
      } else if (readyOrders != null && readyOrders.order === 0) {
        setReady([]);
      }
    };

    const getDelivered = async () => {
      let deliveredOrders;
      let odd = [...delivered];
      const sess = await getSessionID();

      deliveredOrders = JSON.parse(await getdeliveredOrders(sess));
      if (deliveredOrders != null && deliveredOrders.length > 0) {
        const requests = deliveredOrders.map((deliveredOrder) => {
          if (!findInOrders(odd, deliveredOrder.order)) {
            removeOrder(ready, deliveredOrder.order, setReady);
            odd.push(
              <BoxDeliverd
                key={Math.random()}
                order={deliveredOrder.order}
                reload={() => {
                  getDelivered();
                }}
                session={sess}
              />
            );
            setDelivered(odd);
          }
          return true;
        });
        return Promise.all(requests).then(() => {
          removeDuplicates(odd, setDelivered, "Picked");
          removeUnnecessary(odd, ready, setReady);
        });
      } else if (deliveredOrders != null && deliveredOrders.order === 0) {
        setDelivered([]);
      }
    };

    async function fetchMyAPI() {
      const shopSt = await getShop(await getSessionID());
      document.querySelector("#switch").checked = shopSt.status;
      getFresh();
      getAccepted();
      getReady();
      getDelivered();
    }

    fetchMyAPI();

    const timer = setTimeout(() => {
      setCount([]);
    }, 20000);

    return () => clearTimeout(timer);
  }, [count]);

  const sidebar = document.querySelector("nav");
  const toggler = () => {
    sidebar.classList.toggle("close");
    // if (toggle) {
    //   document.documentElement.style.setProperty("--side-nav-width", "250px");
    // } else {
    //   document.documentElement.style.setProperty("--side-nav-width", "80px");
    // }
    setToggle(!toggle);
  };

  // searchBtn.addEventListener("click", () => {
  //     sidebar.classList.remove("close");
  //     console.log("search");
  //     document.documentElement.style.setProperty('--side-nav-width', "250px");
  // })

  return (
    <div>
      <nav className="sidebar close">
        <header>
          <span className="logo">
            <div className="rounded">
              <img src={logo} alt="" />
            </div>
            <div className="text">
              <strong className=".text">LAOPOS</strong>
              <input type="checkbox" id="switch" />
              <label className="shop-lbl" htmlFor="switch" onClick={changeShop}>
                fffffff
              </label>
            </div>
          </span>
          <div className="menu-bar">
            <li
              className="search-box"
              onClick={() => {
                document.querySelector("nav").classList.remove("close");
                setToggle(false);
              }}
            >
              <i className="bx bx-search icon"></i>
              <input type="text" placeholder="Search..." />
            </li>
          </div>
        </header>

        <div className="menu-bar">
          <div className="menu">
            <div className="image-text">
              <li className="image" onClick={toggler}>
                <i
                  style={{ cursor: "pointer" }}
                  className={
                    toggle
                      ? "fa fa-solid fa-bars fa-xl icon"
                      : "fa fa-solid fa-arrow-left fa-xl icon"
                  }
                ></i>
                <div className="text logo-text">
                  <span className="name">Ujjawal Enterprises</span>
                  {/* <span className="profession">Web developer</span> */}
                </div>
              </li>
            </div>

            <ul className="menu-links">
              <li className="nav-link">
                <Link to="/orders/all">
                  <i className="bx bx-home-alt icon"></i>
                  <span className="text nav-text">Dashboard</span>
                </Link>
              </li>

              {/* <li className="nav-link">
                <Link to="#">
                  <i className="bx bx-bar-chart-alt-2 icon"></i>
                  <span className="text nav-text">Revenue</span>
                </Link>
              </li>

              <li className="nav-link">
                <Link to="#">
                  <i className="bx bx-bell icon"></i>
                  <span className="text nav-text">Notifications</span>
                </Link>
              </li>

              <li className="nav-link">
                <Link to="#">
                  <i className="bx bx-pie-chart-alt icon"></i>
                  <span className="text nav-text">Analytics</span>
                </Link>
              </li>

              <li className="nav-link">
                <Link to="#">
                  <i className="bx bx-heart icon"></i>
                  <span className="text nav-text">Likes</span>
                </Link>
              </li>

              <li className="nav-link">
                <Link to="#">
                  <i className="bx bx-wallet icon"></i>
                  <span className="text nav-text">Wallets</span>
                </Link>
              </li> */}
            </ul>
          </div>

          <div className="bottom-content">
            <li className="">
              <Link to="#" onClick={logout}>
                <i className="bx bx-log-out icon"></i>
                <span className="text nav-text">Logout</span>
              </Link>
            </li>
          </div>
        </div>
      </nav>

      <section
        className="home"
        onClick={() => {
          document.querySelector("nav").classList.add("close");
          setToggle(true);
        }}
      >
        <header className="App-header">
          <div className="odbtn">
            <Link to="/orders/all" className="pill-btn pill-all">
              All
            </Link>
            <Link to="/orders/fresh" className="pill-btn pill-fresh">
              Fresh
            </Link>
            <Link to="/orders/accepted" className="pill-btn pill-accepted">
              Accepted
            </Link>
            <Link to="/orders/ready" className="pill-btn pill-ready">
              Ready
            </Link>
            <Link to="/orders/deliverd" className="pill-btn pill-del">
              Dispatched
            </Link>
          </div>
        </header>
        <div className="grid">
          {type === "all" && (
            <div className="grid__outer-grid">
              <div className="grid__inner-grid">
                {[...fresh, ...accepted, ...ready, ...delivered].sort(function (
                  a,
                  b
                ) {
                  var keyA = a.props.order.order.split("-")[1],
                    keyB = b.props.order.order.split("-")[1];

                  // Compare the 2 dates
                  if (keyA < keyB) return 1;
                  if (keyA > keyB) return -1;
                  return 0;
                })}
              </div>
            </div>
          )}
          {type === "fresh" && fresh.length > 0 && (
            <div className="grid__outer-grid">
              <div className="grid__inner-grid">
                {fresh.sort(function (a, b) {
                  var keyA = a.props.order.order.split("-")[1],
                    keyB = b.props.order.order.split("-")[1];

                  // Compare the 2 dates
                  if (keyA < keyB) return -1;
                  if (keyA > keyB) return 1;
                  return 0;
                })}
              </div>
            </div>
          )}
          {type === "fresh" && fresh.length === 0 && (
            <NoOrder msg="Wating for Fresh Orders" />
          )}
          {type === "accepted" && accepted.length > 0 && (
            <div className="grid__outer-grid">
              <div className="grid__inner-grid">
                {accepted.sort(function (a, b) {
                  var keyA = a.props.order.order.split("-")[1],
                    keyB = b.props.order.order.split("-")[1];

                  // Compare the 2 dates
                  if (keyA < keyB) return -1;
                  if (keyA > keyB) return 1;
                  return 0;
                })}
              </div>
            </div>
          )}
          {type === "accepted" && accepted.length === 0 && (
            <NoOrder msg="You dont't have any orders to be ready" />
          )}
          {type === "ready" && ready.length > 0 && (
            <div className="grid__outer-grid">
              <div className="grid__inner-grid">
                {ready.sort(function (a, b) {
                  var keyA = a.props.order.order.split("-")[1],
                    keyB = b.props.order.order.split("-")[1];

                  // Compare the 2 dates
                  if (keyA < keyB) return -1;
                  if (keyA > keyB) return 1;
                  return 0;
                })}
              </div>
            </div>
          )}
          {type === "ready" && ready.length === 0 && (
            <NoOrder msg="Wating for Orders to be ready" />
          )}
          {type === "deliverd" && delivered.length > 0 && (
            <div className="grid__outer-grid">
              <div className="grid__inner-grid">
                {delivered.sort(function (a, b) {
                  var keyA = a.props.order.order.split("-")[1],
                    keyB = b.props.order.order.split("-")[1];

                  // Compare the 2 dates
                  if (keyA < keyB) return -1;
                  if (keyA > keyB) return 1;
                  return 0;
                })}
              </div>
            </div>
          )}
          {type === "deliverd" && delivered.length === 0 && (
            <NoOrder msg="Orders are not delivered or picked yet" />
          )}
        </div>
        <div className="custom-model-main">
          <div className="custom-model-inner">
            <div
              className="close-btn"
              onClick={() => {
                document
                  .querySelector("div.custom-model-main")
                  .classList.remove("model-open");
              }}
            >
              ×
            </div>
            <div className="custom-model-wrap">
              <div className="pop-up-content-wrap">
                {
                  <OtpInput
                    odno={dispstchNo}
                    submit={dispatchOtp}
                    refresh={otp}
                  />
                }
              </div>
            </div>
          </div>
          <div className="bg-overlay"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
