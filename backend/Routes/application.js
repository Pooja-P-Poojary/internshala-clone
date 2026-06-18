const express = require("express");
const router = express.Router();
const application = require("../Model/Application");
const User = require("../Model/User");

router.post("/", async (req, res) => {
  try {

    const userId = req.body.user;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Plan Limits

    const limits = {
      FREE: 1,
      BRONZE: 3,
      SILVER: 5,
      GOLD: Infinity,
    };

    // Expired Paid Plan

    if (
      user.planEndDate &&
      new Date() > new Date(user.planEndDate)
    ) {
  user.subscriptionPlan = "FREE";
  user.applicationsUsed = 0;

  user.planStartDate = null;
  user.planEndDate = null;

  await user.save();
}

    const plan =
      user.subscriptionPlan || "FREE";

    if (user.applicationsUsed == null) {
  user.applicationsUsed = 0;
}

    if (
      user.applicationsUsed >=
      limits[plan]
    ) {
      return res.status(403).json({
        error:
          "Application limit reached for your plan"
      });
    }

    const applicationipdata =
      new application({
        company: req.body.company,
        category: req.body.category,
        coverLetter:
          req.body.coverLetter,
        user: req.body.user,
        Application:
          req.body.Application,
        body: req.body.body,
      });

    const savedApplication =
      await applicationipdata.save();

    user.applicationsUsed += 1;

    await user.save();

    res.status(200).json(
      savedApplication
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error:
        "Internal Server Error",
    });
  }
});
  /*const applicationipdata = new application({
    company: req.body.company,
    category: req.body.category,
    coverLetter: req.body.coverLetter,
    user: req.body.user,
    Application: req.body.Application,
    body: req.body.body,
  });
  await applicationipdata
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
    });
});
router.get("/", async (req, res) => {
  try {
    const data = await application.find();
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application.findById(id);
    if (!data) {
      res.status(404).json({ error: "application not found" });
    }
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  let status;
  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    res.status(404).json({ error: "Invalid action" });
    return;
  }
  try {
    const updateapplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updateapplication) {
      res.status(404).json({ error: "Not able to update the application" });
      return;
    }
    res.status(200).json({ sucess: true, data: updateapplication });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});*/
module.exports = router;

