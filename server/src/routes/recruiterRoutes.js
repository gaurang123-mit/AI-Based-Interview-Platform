const express = require("express");
const router = express.Router();
const {getCandidates, getPerformance, Deleteresults, setpassword, interview_violation}  = require("../controllers/recruiterController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.get("/candidates", authMiddleware, roleMiddleware("recruiter"), getCandidates);

router.get("/performance",authMiddleware,roleMiddleware("recruiter","admin"),getPerformance)

router.post("/set-password",authMiddleware,roleMiddleware("recruiter"),setpassword)


module.exports = router;