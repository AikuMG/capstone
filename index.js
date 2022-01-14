const express = require("express");
const app = express();
const AWS = require('aws-sdk');
const port = process.env.PORT || 3636;
const table = "quizzes";

const investmentChoices = [
  {"type": "stock",
    "risk": "low",
    "return": "medium",
    "monthly": "no",
    "start": "100",},
  {"type": "cd",
    "risk": "none",
    "return": "low",
    "monthly": "no",
    "start": "100+",},
  {"type": "real estate",
    "risk": "high",
    "return": "moderate",
    "monthly": "yes",
    "start": "100k"}
]

let awsConfig = {
  "region": "us-east-1",
  "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
  "accessKeyId": "",
  "secretAccessKey": ""
};
AWS.config.update(awsConfig);

let dynamo = new AWS.DynamoDB.DocumentClient();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.listen(port, () => {
    console.log(`Hosting game on localhost:${port}`);
});

app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/quiz', (req, res) => {

  let body = req.body;
  let createId = Date.now();
  let userId = req.body.userId;

  let input = {
      id: createId,
      userID: userId,
      name: body.userName,
      initial_investment: body.initInvest,
      monthly_contribution: body.monthContr,
      accessibility: body.easeOfFunds,
      will_not_touch: body.setAndForget,
      current_portfolio: body.portfolio,
      investment_goal: body.goal,
      potential_return: body.returns,
      risky_with_money: body.moneyRisk,
      personal_interests: body.interests,
      projects: body.projects,
      volatility_tolerance: body.volatile,
  };


  let params = {
      TableName: table,
      Item: input
  };

  dynamo.put(params, function(err){
    
      if (err) {
          console.log("users::save::error - " + JSON.stringify(err, null, 2));
          res.status(484).send("Unable to save quiz results");
      }

      else {
        let params = {
          TableName: table,
          Key: {
            id: createId
          }
        };

        dynamo.get(params, function (err, userAnswers) {

          if (err) {
            res.status(404).send("Cannot read results.");
          }

          else {
            let data = userAnswers.Item;
            res.render('results', {data, investmentChoices});
          }
        });
      }
  });
});

/*

app.get('/quizzes', (req, res) => {

  let params = {
    TableName: table,
  };
  dynamo.scan(params, function (err, data) {
    if (err) {
      res.status(404).send("Cannot read results.");
    }
    else {
      res.status(200).send(data);
    }
  });
});

app.get('/quizzes/:id', (req, res) => {

  let params = {
    TableName: table,
  };
  dynamo.get(params, function (err, data) {
    if (err) {
      res.status(404).send("Cannot read results.");
    }
    else {
      res.status(200).send(data);
    }
  });
});
*/