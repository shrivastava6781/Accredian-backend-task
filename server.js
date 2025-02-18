// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { PrismaClient } = require("@prisma/client");
// const nodemailer = require('nodemailer');

// const app = express();
// const prisma = new PrismaClient();

// app.use(express.json());
// app.use(cors()); // Allow frontend requests



// const sendEmail = async (referrerEmail, refereeEmail, courseName) => {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: refereeEmail,
//         subject: "You Have Been Referred!",
//         text: `Hello, you have been referred to join the ${courseName} course. Register now!`
//     };

//     await transporter.sendMail(mailOptions);
// };


// // ✅ API Endpoint to submit referral
// // app.post("/api/referrals", async (req, res) => {
// //   try {
// //     const { referrerName, referrerEmail, refereeName, refereeEmail, courseName, message } = req.body;

// //     const newReferral = await prisma.referral.create({
// //       data: {
// //         referrerName,
// //         referrerEmail,
// //         refereeName,
// //         refereeEmail,
// //         courseName,
// //         message,
// //       },
// //     });

// //     res.status(201).json({ message: "Referral submitted successfully", referral: newReferral });
// //   } catch (error) {
// //     console.error("Error submitting referral:", error);
// //     res.status(500).json({ message: "Internal server error" });
// //   }
// // });
// app.post("/api/referrals", async (req, res) => {
//     try {
//       const { referrerName, referrerEmail, refereeName, refereeEmail, courseName, message } = req.body;
  
//       // Check if a referral already exists with the same referrerEmail
//       const existingReferral = await prisma.referral.findUnique({
//         where: { referrerEmail }
//       });
  
//       if (existingReferral) {
//         return res.status(400).json({ message: "This email has already been used to refer someone." });
//       }
  
//       // If not, create a new referral
//       const newReferral = await prisma.referral.create({
//         data: { referrerName, referrerEmail, refereeName, refereeEmail, courseName, message },
//       });
  
//       res.status(201).json({ message: "Referral submitted successfully", referral: newReferral });
//     } catch (error) {
//       console.error("Error submitting referral:", error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
  

// // ✅ API to get all referrals
// app.get("/api/referrals", async (req, res) => {
//   try {
//     const referrals = await prisma.referral.findMany();
//     res.json(referrals);
//   } catch (error) {
//     console.error("Error fetching referrals:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));





require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors()); // Allow frontend requests

// ✅ Function to send email
const sendEmail = async (referrerEmail, refereeEmail, courseName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: refereeEmail,
      subject: "You Have Been Referred!",
      text: `Hello, you have been referred to join the ${courseName} course by ${referrerEmail}. Register now!`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Referral email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// ✅ API Endpoint to submit referral
app.post("/api/referrals", async (req, res) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail, courseName, message } = req.body;

    // 🔍 Check if a referral with the same referee email already exists
    const existingReferral = await prisma.referral.findUnique({
      where: { refereeEmail },
    });

    if (existingReferral) {
      return res.status(400).json({ message: "This person has already been referred!" });
    }

    // ✅ Create a new referral entry in the database
    const newReferral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        courseName,
        message,
      },
    });

    // ✅ Send email notification to referee
    await sendEmail(referrerEmail, refereeEmail, courseName);

    res.status(201).json({ message: "Referral submitted and email sent successfully!", referral: newReferral });
  } catch (error) {
    console.error("Error submitting referral:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ API to get all referrals
app.get("/api/referrals", async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany();
    res.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
