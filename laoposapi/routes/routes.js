const express = require("express");
const router = express.Router();

const cheerio = require("cheerio");

module.exports = router;

var date = new Date();
const cye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
const cmo = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(date);
const cda = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
const cdate = `${cye}-${cmo}-${cda}`;

date.setDate(date.getDate() - 2);
const pye = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
const pmo = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(date);
const pda = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
const pdate = `${pye}-${pmo}-${pda}`;

console.log(cdate, pdate);

const getOrderDetails = async (session, id) => {
  const axios = require("axios");
  var data = JSON.stringify({
    id: parseInt(id),
  });

  var config = {
    method: "get",
    url: "https://www.laobp.in/admin/Get_Order_Item_Detail",
    headers: {
      "Content-Type": "application/json",
      Cookie: session,
    },
    data: data,
  };
  return await axios(config)
    .then((dat) => {
      return dat.data;
    })
    .catch((error) => {
      return "null";
    });
  // return it
};

//Post Method
router.post("/getSession", async (req, res) => {
  const axios = require("axios");

  await axios
    .post(
      "https://www.laobp.in/Home/Checklogin",
      {
        email: req.body.data.email,
        pass: req.body.data.pass,
      },
      { withCredentials: true }
    )
    .then((dat) => {
      if (dat.data == "done") {
        let session = dat.headers["set-cookie"][0].substr(
          0,
          dat.headers["set-cookie"][0].indexOf(";")
        );
        return res.status(200).json({ session });
      } else {
        return res.status(200).json({ error: "error" });
      }
    })
    .catch((error) => {
      console.log("login error");

      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
      // console.log("error", error);
      return res.status(500);
    });
});

//Get all Method
router.post("/freshOrders", async (req, res) => {
  const axios = require("axios");

  var config = {
    method: "get",
    url: "https://www.laobp.in/admin/Check_Fresh_Order_data",
    headers: {
      Cookie: req.body.data.session,
    },
  };

  var config2 = {
    method: "get",
    url: "https://www.laobp.in/admin/index",
    headers: {
      Cookie: req.body.data.session,
    },
  };

  var config3 = {
    method: "get",
    url: "https://www.laobp.in/admin/Today_Bussiness",
    headers: {
      Cookie: req.body.data.session,
    },
  };

  await axios(config)
    .then(function (response) {
      let orders = response.data.order;
      if (orders >= 0) {
        axios(config2)
          .then(function (response) {
            axios(config3)
              .then(function (response) {
                const $ = cheerio.load(response.data);
                // targets the specific table with a selector
                var html_table = $("#demo-dt-basic > tbody");
                // gets table cell values; loops through all tr rows
                let dataP = [];

                const table = html_table.find("tr");
                const count = table.length;
                let countComp = 0;

                const rs = table.each(async function (i, item) {
                  let tab = $("td", item)
                    .map(function () {
                      //console.log($(this).find('a').attr('onclick'))
                      let text = $(this).text().trim();
                      if (text != "") {
                        return text;
                      } else {
                        return $(this).find("a").attr("onclick");
                      }
                    })
                    .toArray();
                  return Promise.all(tab).then(() => {
                    let orderID = tab[4].split("accept(")[1].split(")")[0];

                    // .then((items) => {
                    let json = {
                      order: {
                        order: tab[2],
                        date: tab[1],
                        customerName: tab[3],
                        orderID,
                      },
                    };
                    dataP.push(json);
                    countComp++;

                    if (countComp == count) {
                      return res.status(200).json(JSON.stringify(dataP));
                      //dataP = [];
                    }
                  });
                });
                Promise.all(rs).then(() => {
                  if (count === 0) {
                    return res.status(200).json(JSON.stringify({ order: 0 }));
                  }
                });
              })
              .catch(function (error) {
                //console.log(error);
              });
          })
          .catch(function (error) {
            //console.log(error);
          });
      } else {
        return res.status(200).json("0");
      }
    })
    .catch(function (error) {
      //console.log(error);
    });
});

router.post("/acceptedOrders", async (req, res) => {
  const axios = require("axios");

  var config = {
    method: "get",
    url: `https://www.laobp.in/admin/Accepted_Order_Custome_DateWise?strt=${pdate}&enddt=${cdate}`,
    headers: {
      Cookie: req.body.data.session,
    },
  };

  axios(config)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      // targets the specific table with a selector
      var html_table = $("#demo-dt-basic > tbody");
      // gets table cell values; loops through all tr rows
      let dataP = [];

      const table = html_table.find("tr");
      let count = table.length;
      let countComp = 0;

      const rs = table.each(async function (i, item) {
        let tab = $("td", item)
          .map(function () {
            //console.log($(this).find('a').attr('onclick'))
            let text = $(this).text().trim();
            if (!text.includes("Ready To Move")) {
              if (!text.includes("View")) {
                return text;
              } else {
                return $(this).find(".btn").attr("onclick");
              }
            } else {
              if (text.includes("Confirmed")) {
                count--;
                return;
              } else {
                return text;
              }
            }
          })
          .toArray();
        return Promise.all(tab).then(() => {
          if (tab[10]) {
            let orderID = tab[8].split("OrdrView(")[1].split(")")[0];

            // // .then((items) => {
            let json = {
              order: {
                order: tab[2],
                date: tab[1],
                customerName: tab[3],
                status: tab[10],
                orderID,
              },
            };
            dataP.push(json);
            countComp++;
            if (countComp == count) {
              return res.status(200).json(JSON.stringify(dataP));
            }
          }
        });
      });
      Promise.all(rs).then(() => {
        if (count === 0) {
          return res.status(200).json(JSON.stringify({ order: 0 }));
        }
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/deliveredOrders", async (req, res) => {
  const axios = require("axios");
  var config = {
    method: "get",
    url: `https://www.laobp.in/admin/Dispatch_Order_Custome_DateWise?strt=${pdate}&enddt=${cdate}`,
    headers: {
      Cookie: req.body.data.session,
    },
  };

  axios(config)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      // targets the specific table with a selector
      var html_table = $("#demo-dt-basic > tbody");
      // gets table cell values; loops through all tr rows
      let dataP = [];

      const table = html_table.find("tr");
      let count = table.length;
      let countComp = 0;

      const rs = table.each(async function (i, item) {
        let tab = $("td", item)
          .map(function () {
            //console.log($(this).find('a').attr('onclick'))
            let text = $(this).text().trim();
            if (text.includes("Pending")) {
              return "Picked";
            } else {
              if (!text.includes("View")) {
                return text;
              } else {
                return $(this).find(".btn").attr("onclick");
              }
            }
          })
          .toArray();
        return Promise.all(tab).then(() => {
          if (tab[8]) {
            let orderID = tab[5].split("OrdrView(")[1].split(")")[0];
            //   let items = await getOrderDetails(
            //     req.body.data.session,
            //     orderID
            //   );
            //   // // .then((items) => {
            let json = {
              order: {
                order: tab[2],
                date: tab[1],
                customerName: tab[3],
                partnerName: tab[7],
                status: tab[8],
                orderID,
              },
            };
            dataP.push(json);
            countComp++;

            if (countComp == count) {
              return res.status(200).json(JSON.stringify(dataP));
            }
          }
        });
      });

      Promise.all(rs).then(() => {
        if (count === 0) {
          return res.status(200).json(JSON.stringify({ order: 0 }));
        }
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/itemsOrders", async (req, res) => {
  const items = await getOrderDetails(req.body.data.session, req.body.data.id);
  return res.status(200).json(items);
});

router.post("/getShop", async (req, res) => {
  const axios = require("axios");
  var config = {
    method: "get",
    url: `https://www.laobp.in/admin/Index`,
    headers: {
      Cookie: req.body.data.session,
    },
  };

  axios(config)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      // targets the specific table with a selector
      var html_switch = $(".switchToggle > input");
      // gets table cell values; loops through all tr rows
      if (html_switch.attr("checked")) {
        return res.status(200).json({ status: true });
      } else {
        return res.status(200).json({ status: false });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/setShop", async (req, res) => {
  const axios = require("axios");
  var config = {
    method: "get",
    url: `https://www.laobp.in/Home/CHangeShop_Status`,
    headers: {
      Cookie: req.body.data.session,
    },
  };

  axios(config)
    .then(function (response) {
      console.log(response);
      if (response.data == 1) {
        return res.status(200).json({ status: true });
      } else {
        return res.status(200).json({ status: false });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/readyOrders", async (req, res) => {
  const axios = require("axios");

  var config = {
    method: "get",
    url: `https://www.laobp.in/admin/Ready_Order_Custome_DateWise?strt=${pdate}&enddt=${cdate}`,
    headers: {
      Cookie: req.body.data.session,
    },
  };

  axios(config)
    .then(function (response) {
      const $ = cheerio.load(response.data);
      // targets the specific table with a selector
      var html_table = $("#demo-dt-basic > tbody");
      // gets table cell values; loops through all tr rows
      let dataP = [];

      const table = html_table.find("tr");
      let count = table.length;
      let countComp = 0;

      const rs = table.each(async function (i, item) {
        let tab = $("td", item)
          .map(function () {
            //console.log($(this).find('a').attr('onclick'))
            let text = $(this).text().trim();
            if (!text.includes("Dispatch")) {
              if (!text.includes("View")) {
                return text;
              } else {
                return $(this).find(".btn").attr("onclick");
              }
            } else {
              if (!text.includes("Dispatched")) {
                return "Dispach--" + $(this).find(".btn").attr("onclick");
              } else {
                count--;
                return;
              }
            }
          })
          .toArray();

        Promise.all(tab).then(() => {
          if (tab[8]) {
            let orderID = tab[6].split("OrdrView(")[1].split(")")[0];
            let status = "";
            let delId = "";
            if (tab[8].includes("Dispach")) {
              status = "Dispach";
              delId = tab[8].split("Dispach--getdata(")[1].split(",")[0];
            } else {
              status = tab[8];
            }
            // // .then((items) => {
            let json = {
              order: {
                order: tab[2],
                date: tab[1],
                customerName: tab[3],
                partnerName: tab[7].trim(),
                status,
                orderID,
                delId,
              },
            };
            dataP.push(json);
            countComp++;

            if (countComp == count) {
              return res.status(200).json(JSON.stringify(dataP));
            }
          }
        });
      });
      Promise.all(rs).then(() => {
        if (count === 0) {
          return res.status(200).json(JSON.stringify({ order: 0 }));
        }
      });
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/acceptOrder", async (req, res) => {
  const acId = req.body.data.itemIds;

  const axios = require("axios");

  var data = JSON.stringify({
    id: parseInt(req.body.data.id),
  });

  var config = {
    method: "get",
    url: "https://www.laobp.in/admin/Accept_Order",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.body.data.session,
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      const total = acId.length;
      let count = 0;
      acId.map((id, index) => {
        var data = JSON.stringify({
          txtvale: "NA",
          rowid: parseInt(id),
        });

        var config2 = {
          method: "get",
          url: "https://www.laobp.in/admin/Update_Info",
          headers: {
            "Content-Type": "application/json",
            Cookie: req.body.data.session,
          },
          data: data,
        };

        axios(config2)
          .then(function (response) {
            count++;
            if (count == total) {
              return res.status(200).json(JSON.stringify({ accepted: true }));
            }
          })
          .catch(function (error) {
            console.log(error);
          });
      });
    })
    .catch(function (error) {
      return res.status(500);
    });
});

router.post("/sentOtp", async (req, res) => {
  const axios = require("axios");
  var data = JSON.stringify({
    id: parseInt(req.body.data.dboy),
    rowid: parseInt(req.body.data.rowid),
  });

  var config = {
    method: "get",
    url: "https://www.laobp.in/admin/getboydetail",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.body.data.session,
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      return res.status(200).json(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/submitOtp", async (req, res) => {
  const axios = require("axios");
  var data = JSON.stringify({
    uid: req.body.data.uid,
    otp: req.body.data.otp,
    odno: req.body.data.odno,
    mob: req.body.data.mob,
  });

  var config = {
    method: "get",
    url: "https://www.laobp.in/admin/ReadyToMove_order_submit",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.body.data.session,
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      if (response.data == "1") {
        return res.status(200).json(JSON.stringify({ submit: true }));
      } else {
        return res.status(200).json(JSON.stringify({ submit: false }));
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});

router.post("/readyOrder", async (req, res) => {
  const axios = require("axios");

  var data = JSON.stringify({
    id: parseInt(req.body.data.id),
  });

  var config = {
    method: "get",
    url: "https://www.laobp.in/admin/ReadyToMove_Order",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.body.data.session,
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(response);
      return res.status(200).json(JSON.stringify({ accepted: true }));
    })
    .catch(function (error) {
      return res.status(200).json(JSON.stringify({ accepted: false }));
    });
});

//Get by ID Method
router.get("/getOne/:id", async (req, res) => {
  try {
    const data = await Model.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Update by ID Method
router.patch("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const options = { new: true };

    const result = await Model.findByIdAndUpdate(id, updatedData, options);

    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Delete by ID Method
router.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Model.findByIdAndDelete(id);
    res.send(`Document with ${data.name} has been deleted..`);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
