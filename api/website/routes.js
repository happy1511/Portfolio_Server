const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  port: 465,
  auth: {
    user: process.env.AUTHOR_MAIL,
    pass: process.env.AUTHER_PASS,
  },
});

const generateHtml = (name, msg, emailID) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message from Portfolio!</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: start;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="header">Password Reset Request</h1>
    <p>Hello from ${name},</p>
    <p>Someone communicated to you from your portfolio ${name} email ${emailID}.</p>
    <p>${msg}</p>
  </div>
</body>
</html>
`;
};

// Mail function to send emails
const mail = async (name, msg, mailId) => {
  const mailOptions = {
    from: "Portfolio <portfolio.gmail.com>",
    to: "happypatel151103@gmail.com",
    subject: "Msg from Portfolio",
    html: generateHtml(name, msg, mailId),
    text: `Hello from ${name},\nSomeone communicated to you from your portfolio ${name} email ${mailId}.\n${msg}\n`,
  };

  return transport.sendMail(mailOptions);
};

router.post("/", async (req, res) => {
  try {
    const { name, msg, mailId } = req.body;
    await mail(name, msg, mailId);
    console.log(name, msg, mailId);
    res.status(200).json({ message: "Message sent" });
  } catch (er) {
    console.log(er);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
