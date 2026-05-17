// ============================================================
// controllers/journal.controller.js — Journal de Trading
// ============================================================
const JournalEntry = require("../models/JournalEntry");

const getJournalEntries = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find({ author: req.user._id })
      .sort({ date: -1 })
      .populate("relatedTrades", "pair direction result profitLoss");

    res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) { next(error); }
};

const getJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id)
      .populate("relatedTrades");

    if (!entry) return res.status(404).json({ success: false, message: "Entrée introuvable" });
    if (entry.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Accès interdit" });
    }

    res.status(200).json({ success: true, data: entry });
  } catch (error) { next(error); }
};

const createJournalEntry = async (req, res, next) => {
  try {
    req.body.author = req.user._id;
    const entry = await JournalEntry.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
};

const updateJournalEntry = async (req, res, next) => {
  try {
    let entry = await JournalEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Introuvable" });
    if (entry.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Accès interdit" });
    }

    entry = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    res.status(200).json({ success: true, data: entry });
  } catch (error) { next(error); }
};

const deleteJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: "Introuvable" });
    if (entry.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Accès interdit" });
    }

    await entry.deleteOne();
    res.status(200).json({ success: true, message: "Entrée supprimée" });
  } catch (error) { next(error); }
};

module.exports = {
  getJournalEntries, getJournalEntry,
  createJournalEntry, updateJournalEntry, deleteJournalEntry,
};
