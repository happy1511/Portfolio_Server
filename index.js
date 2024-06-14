const nodeMailer = require("nodemailer");

const express = require("express");
const dotenv = require("dotenv");
const port = process.env.PORT || 8000;

dotenv.config();
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const transport = nodeMailer.createTransport(
  {
    service: "gmail",
    host: "smtp.gmail.com",

    secure: false,
    port: 465,
    auth: {
      user: process.env.AUTHOR_MAIL,
      pass: process.env.AUTHER_PASS,
    },
  },
  (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  }
);

const generateHtml = (name, msg, emailID) => {
  const emailBody = `
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

    img {
      max-width: 100%;
      height: auto;
    }

    h1 {
      color: #333;
      text-align: center;
    }

    p {
      color: #555;
      margin-bottom: 15px;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    .footer {
      margin-top: 20px;
      text-align: start;
      color: #777;
    }

    .image{
      width: 100px;
      object-fit: contain;
      height: 100px;
    }

    .header{
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
  return emailBody;
};

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

app.post("/", async (req, res) => {
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
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}`);
});
