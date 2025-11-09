const express = require("express");
const Workout = require("../models/workoutModel");
const mongoose = require("mongoose");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

// require auth for all workout routes
router.use(requireAuth);

// controller logic moved inline: get all workouts
router.get("/", async (req, res) => {
  const user_id = req.user._id;
  try {
    const workouts = await Workout.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(workouts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get a single workout
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "not a valid ID." });
  }
  try {
    const workout = await Workout.findById(id);

    if (!workout) {
      return res.status(404).json({ error: "no such workout found" });
    }

    res.status(200).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// create a new workout
router.post("/", async (req, res) => {
  const { title, load, reps } = req.body;

  let emptyFields = [];

  if (!title) {
    emptyFields.push("title");
  }
  if (!load) {
    emptyFields.push("loads");
  }
  if (!reps) {
    emptyFields.push("reps");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields.", emptyFields });
  }

  // add doc to db
  try {
    const user_id = req.user._id;
    const workout = await Workout.create({ title, load, reps, user_id });
    res.status(200).json(workout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// delete a workout
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "not a valid ID." });
  }

  try {
    const workout = await Workout.findOneAndDelete({ _id: id });

    if (!workout) {
      return res.status(404).json({ error: "no such workout found." });
    }

    res.status(200).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// update a workout
router.patch("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "not a valid ID." });
  }

  try {
  // return the updated document (new: true) so frontend gets the latest data
  const workout = await Workout.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true, runValidators: true });

    if (!workout) {
      return res.status(404).json({ error: "no such workout found." });
    }

    res.status(200).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
