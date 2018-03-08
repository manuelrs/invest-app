const express = require("express");
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const Portfolio = require("../models/portfolio");
const User = require("../models/user");
const Message = require("../models/message");

/* GET home page. */
router.get("/", ensureLoggedIn(), function (req, res, next) {
  Portfolio.find({}, (err, portfolios) => {
    if (err) return next(err);

    res.json(portfolios);
  });
});

router.post("/", ensureLoggedIn(), (req, res, next) => {
  const managerId = req.user._id;
  const description = req.body.description;
  const portfolioName = req.body.portfolioName;
  const stocks = req.body.stocks;

  const portfolioInfo = {
    manager: managerId,
    description,
    portfolioName,
    stocks
  };

  User.findById(managerId, (err, manager) => {
    if (err) return next(err);
    if (manager.role === "manager") {
      const newPortfolio = new Portfolio(portfolioInfo);

      newPortfolio.save(err => {
        if (err) return next(err);
        User.findByIdAndUpdate(
          managerId,
          {
            $push: { managerPortfolios: newPortfolio._id }
          },
          (err, manager) => {
            if (err) return next(err);
            res.json(newPortfolio);
          }
        );
      });
    } else {
      res.json("The user is not a manager.");
    }
  });
});

router.patch(
  "/:portfolioId",
  ensureLoggedIn(),
  (req, res, next) => {
    const portfolioId = req.params.portfolioId;
    console.log("portfolioId in user", portfolioId)
    const rate = Object.keys(req.body)
    console.log("rate in user", rate)
    Portfolio.findByIdAndUpdate(
      req.params.portfolioId,
      {
        $push: { investors: req.user._id },
        $push: { ratings: rate }
      },
      (err, portfolio) => {
        if (err) return next(err);
        res.json(portfolio);
      }
    );
  }
);

// router.get("/benchmark", ensureLoggedIn(), function(req, res, next) {
//   // const startDate = req.params.startDate;
//   // const endDate = req.params.endDate;
//   Benchmark.find((err, benchmark) => {
//     console.log(res);
//     if (err) return next(err);
//     console.log(benchmark);
//     res.json(benchmark);
//   });
// });

router.get("/:portfolioId", ensureLoggedIn(), function (req, res, next) {
  const portfolioId = req.params.portfolioId;
  Portfolio.findById(portfolioId)
    // .populate("messages")
    // .populate("messages.user")
    .populate({
      path: "messages",
      populate: {
        path: "user"
      }
    })
    .then(message => {
      res.json(message);
    });
});

router.get("/:portfolioId/comments", ensureLoggedIn(), function (
  req,
  res,
  next
) {
  const portfolioId = req.params.portfolioId;
  Portfolio.findById(portfolioId, (err, portfolio) => {
    if (err) return next(err);
    res.json(portfolio);
  });
});

router.patch("/:portfolioId/returns", ensureLoggedIn(), (req, res, next) => {
  const portfolioReturns = req.body.portfolioReturns;

  Portfolio.findByIdAndUpdate(
    req.params.portfolioId,
    { returns: portfolioReturns },
    (err, portfolioReturns) => {
      if (err) return next(err);
      res.json("portfolioReturns");
    }
  );
});

router.post("/:portfolioId/comment", ensureLoggedIn(), (req, res, next) => {
  const messageObject = req.body.messageObject;

  const newMessage = new Message(messageObject);

  newMessage.save(err => {
    if (err) return next(err);
    Portfolio.findByIdAndUpdate(
      req.params.portfolioId,
      {
        $push: { messages: newMessage.id }
      },
      (err, portfolio) => {
        if (err) return next(err);
        res.json(portfolio);
      }
    );
  });
});

router.patch("/:portfolioId", ensureLoggedIn(), (req, res, next) => {
  const portfolioId = req.params.portfolioId;
  const managerId = req.user._id;
  const description = req.body.description;
  const portfolioName = req.body.portfolioName;
  const stocks = req.body.stocks;

  const portfolioInfo = {
    description: description,
    portfolioName: portfolioName,
    stocks: stocks
  };
  console.log(portfolioInfo);

  User.findById(managerId, (err, manager) => {
    if (err) return next(err);
    if (manager.role === "manager") {
      Portfolio.findByIdAndUpdate(
        portfolioId,
        portfolioInfo,
        (err, portfolio) => {
          if (err) return next(err);
          console.log(portfolio);
          res.json(portfolio);
        }
      );
    } else {
      res.json("The user is not a manager.");
    }
  });
});

module.exports = router;
