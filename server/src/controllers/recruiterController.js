const Result = require("../models/Result");
const User = require("../models/User")
const InterviewPost = require("../models/Interview");
const { deleteInterviewPost } = require("./interviewPostController");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs")
const Interviewpost = require("../models/interviewpost")
const createMailTransporter = require("./authController")
const cloudinary  = require("../config/cloudinary")


// controllers/userController.js
const getCandidates = async (req, res) => {
  try {
    const candidates = await User.find({ role: "candidate" })
      .select("name email skills experience education profileCompleted")
      .sort({ createdAt: -1 });
    res.status(200).json({ candidates });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};


const getPerformance = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const results = await Result.find()
      .populate("candidateId", "name email")
      .populate({
        path: "interviewId",
        match: {
          recruiterId
        }
      });

    const filteredResults = results.filter(
      r => r.interviewId
    );

    res.status(200).json({
      success: true,
      results: filteredResults
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


function getPublicId(videoUrl) {
  const parts = videoUrl.split("/upload/")[1];

  // Remove version number
  const withoutVersion = parts.replace(/^v\d+\//, "");

  // Remove extension
  return withoutVersion.replace(/\.[^/.]+$/, "");
}

const Deleteresults = async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultID)
      .select("interviewId questions")
      .lean();

    if (!result) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    const interview = await InterviewPost.findById(result.interviewId)
      .select("recruiterId")
      .lean();

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    if (interview.recruiterId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Delete all Cloudinary videos in parallel
    await Promise.all(
      result.questions
        .filter((q) => q.recordingUrl)
        .map(async (q) => {
          try {
            const publicId = getPublicId(q.recordingUrl);

            await cloudinary.uploader.destroy(publicId, {
              resource_type: "video",
            });
          } catch (err) {
            console.error(`Failed to delete ${q.recordingUrl}`, err);
          }
        })
    );

    await Result.findByIdAndDelete(req.params.resultID);

    return res.status(200).json({
      message: "Result deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const setpassword = async (req, res) => {
  const { password } = req.body;
  try {
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await Admin.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      passwordChanged: true
    })

    return res.status(200).json({
      message: "the password set successfully",
      passwordChanged: true
    })
  }
  catch (err) {

    return res.status(500).json({
      message: err.message
    });
  }

}


module.exports = {
  getCandidates,
  getPerformance,
  Deleteresults,
  setpassword,
  getPublicId
};
