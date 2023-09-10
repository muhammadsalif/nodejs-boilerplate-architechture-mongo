const { Router } = require("express");
const router = Router();
const v1 = require("./v1/index");

router.use("/v1", v1);

router.use("/*", (req, res) => {
  res.status(404).json({ status: false, message: "NOT_FOUND" });
});
router.use("/oauth/*", (req, res) => {
  res.status(404).json({ status: false, message: "NOT_FOUND" });
});

module.exports = router;
