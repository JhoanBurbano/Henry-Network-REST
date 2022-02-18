const router = require("express").Router();
const { newReport, getReports, reports, cleanReports, newAutorization, getAutorization } = require('../controllers/reportes.contoller')
router.get("/auth/", getAutorization)
router.get("/", getReports);
router.post("/auth/", newAutorization)
router.post("/", newReport);
router.put("/", reports);
router.delete("/:iduser", cleanReports)


module.exports = router;