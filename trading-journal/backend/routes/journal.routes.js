// routes/journal.routes.js
const express = require("express");
const router  = express.Router();
const {
  getJournalEntries, getJournalEntry,
  createJournalEntry, updateJournalEntry, deleteJournalEntry,
} = require("../controllers/journal.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.route("/").get(getJournalEntries).post(createJournalEntry);
router.route("/:id").get(getJournalEntry).patch(updateJournalEntry).delete(deleteJournalEntry);

module.exports = router;
