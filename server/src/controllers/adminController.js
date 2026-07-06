const AIUsage = require("../models/AIUsage");
const User = require("../models/User");
const Admin = require("../models/Admin")
const bcrypt = require("bcryptjs")
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


const addRecruiter = async(req,res) =>{
  try{

    const {name , email} = req.body;

    if(!name || !email){
      return res.status(400).json({
        message:"please provide name and email"
      })
    }

    const emailExist = await Admin.findOne({email})

    if(emailExist){
      return res.status(409).json({
        message:"the user with this email is already registered"
      })
    }
    const hashedEnvPassword = await bcrypt.hash(process.env.RECRUITER_PASSWORD,10)
    const recruiter  = await Admin.create({
      name,
      email,
      password:hashedEnvPassword
    })
   

    return res.status(200).json({
      recruiter:recruiter,
      message:"the recruiter added successfully"
    })


  }
  catch(err){
    res.status(500).json({
      message:`server error: ${err}`
    })

  }
}
const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;

    const recruiter = await Admin.findOneAndDelete({
      _id: id,
    });

    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    res.status(200).json({ message: "Recruiter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await User.findOneAndDelete({
      _id: id,
      role: "candidate"
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAIAnalytics = async (req, res) => {
  try {
    let analytics = await AIUsage.findOne({});
    let a  = 1;
    if(!analytics){
     analytics =  await AIUsage.create({});
     a =2;

    }

    const COST_PER_1M_TOKENS = 6.25; // Approx GPT-4o average cost
    // console.log("analytics:",analytics)
    // console.log("a:",a)
  const estimatedCost = (analytics.totalTokens / 1_000_000) * COST_PER_1M_TOKENS;
  // console.log("cost:",estimatedCost)

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
