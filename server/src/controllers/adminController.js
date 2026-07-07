const AIUsage = require("../models/AIUsage");
const User = require("../models/User");
const Admin = require("../models/Admin")
const Resume = require("../models/Resume")
const bcrypt = require("bcryptjs")
const cloudinary = require("../config/cloudinary")
const { createMailTransporter } = require("./authController")

const transporter = createMailTransporter();
const getCandidates = async (req, res) => {
  try {
    const candidates = await User.find({ role: "candidate" })
      .select("_id name email");

    res.status(200).json({ candidates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecruiters = async (req, res) => {
  try {
    const recruiters = await Admin.find({})
      .select("name email");

    res.status(200).json({ recruiters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addRecruiter = async (req, res) => {
  try {

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "please provide name and email"
      })
    }

    const emailExist = await Admin.findOne({ email })

    if (emailExist) {
      return res.status(409).json({
        message: "the user with this email is already registered"
      })
    }
    const hashedEnvPassword = await bcrypt.hash(process.env.RECRUITER_PASSWORD, 10)
    const recruiter = await Admin.create({
      name,
      email,
      password: hashedEnvPassword
    })

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "portal invitation",
      text: `dear ${name} you have been added as recruiter in interview platform by admin`
    });

    return res.status(200).json({
      recruiter: recruiter,
      message: "the recruiter added successfully"
    })


  }
  catch (err) {
    res.status(500).json({
      message: `server error: ${err}`
    })

  }
}
const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const info = await Admin.findById(id).select("name email")
    const recruiter = await Admin.findOneAndDelete({
      _id: id,
    });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }


    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: info.email,
      subject: "removed user from platfrom",
      text: `dear ${info.name} you have been removed from the interview platform by admin`
    });

    res.status(200).json({ message: "Recruiter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



function getPublicId(resumeUrl) {
  const parts = resumeUrl.split("/upload/")[1];

  // Remove version number
  return parts.replace(/^v\d+\//, "");
}


const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const resumes = await Resume.find({ candidate: id }).select("resumeUrl")
    const info = await User.findById(id).select("name email")
    
    await Promise.all(
      resumes.map(async (resume) => {
        try {
          const publicId = getPublicId(resume.resumeUrl);
          const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw",
          });

        } catch (err) {
          console.error(err);
        }
      })
    );
    await Resume.deleteMany({ candidate: id });

    const candidate = await User.findOneAndDelete({
      _id: id,
      role: "candidate"
    });


    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: info.email,
      subject: "removed user from platfrom",
      text: `dear ${info.name} you have been removed from the interview platform by admin`
    });
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAIAnalytics = async (req, res) => {
  try {
    let analytics = await AIUsage.findOne({});
    let a = 1;
    if (!analytics) {
      analytics = await AIUsage.create({});
      a = 2;

    }

    const COST_PER_1M_TOKENS = 6.25;

    const estimatedCost = (analytics.totalTokens / 1_000_000) * COST_PER_1M_TOKENS;


    if (!analytics) {
      return res.status(404).json({
        totalRequests: 0,
        totalInterviews: 0,
        resumeTokens: 0,
        questionTokens: 0,
        evaluationTokens: 0,
        summaryTokens: 0,
        totalTokens: 0,
      });
    }

    res.status(200).json({
      totalRequests: analytics.totalRequests,
      totalInterviews: analytics.totalInterviews,
      questionTokens: analytics.questionTokens,
      resumeTokens: analytics.resumeTokens,
      evaluationTokens: analytics.evaluationTokens,
      summaryTokens: analytics.summaryTokens,
      totalTokens: analytics.totalTokens,
      estimatedCost: estimatedCost.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



module.exports = {
  getAIAnalytics,
  getCandidates,
  getRecruiters,
  addRecruiter,
  deleteCandidate,
  deleteRecruiter,
};
