const { Router } = require("express");
const { getCompany, createCompany, updateCompany } = require("../controllers/company");

const router = Router();


router.post("/", createCompany);

router.get("/:companyId", getCompany)

router.put("/:companyId", updateCompany)


module.exports = router;