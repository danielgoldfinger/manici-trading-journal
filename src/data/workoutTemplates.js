// Pre-defined workout templates — edit once program is decided.
// Each template pre-fills the exercise table so logging is just editing actuals.

export const WORKOUT_TEMPLATES = [
  {
    name: 'Push Day',
    type: 'strength',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 6, weight_lbs: '' },
      { name: 'Overhead Press', sets: 3, reps: 8, weight_lbs: '' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight_lbs: '' },
      { name: 'Tricep Pushdown', sets: 3, reps: 12, weight_lbs: '' },
      { name: 'Lateral Raises', sets: 3, reps: 15, weight_lbs: '' },
    ],
  },
  {
    name: 'Pull Day',
    type: 'strength',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 5, weight_lbs: '' },
      { name: 'Pull-Ups', sets: 4, reps: 8, weight_lbs: '' },
      { name: 'Barbell Row', sets: 3, reps: 8, weight_lbs: '' },
      { name: 'Face Pulls', sets: 3, reps: 15, weight_lbs: '' },
      { name: 'Barbell Curl', sets: 3, reps: 12, weight_lbs: '' },
    ],
  },
  {
    name: 'Leg Day',
    type: 'strength',
    exercises: [
      { name: 'Back Squat', sets: 4, reps: 6, weight_lbs: '' },
      { name: 'Romanian Deadlift', sets: 3, reps: 10, weight_lbs: '' },
      { name: 'Leg Press', sets: 3, reps: 12, weight_lbs: '' },
      { name: 'Walking Lunges', sets: 3, reps: 12, weight_lbs: '' },
      { name: 'Calf Raises', sets: 4, reps: 15, weight_lbs: '' },
    ],
  },
  {
    name: 'Full Body',
    type: 'mixed',
    exercises: [
      { name: 'Squat', sets: 3, reps: 8, weight_lbs: '' },
      { name: 'Bench Press', sets: 3, reps: 8, weight_lbs: '' },
      { name: 'Deadlift', sets: 3, reps: 5, weight_lbs: '' },
      { name: 'Pull-Ups', sets: 3, reps: 8, weight_lbs: '' },
      { name: 'Overhead Press', sets: 3, reps: 8, weight_lbs: '' },
    ],
  },
  {
    name: 'Conditioning',
    type: 'conditioning',
    exercises: [
      { name: 'KB Swings', sets: 5, reps: 20, weight_lbs: '' },
      { name: 'Box Jumps', sets: 4, reps: 10, weight_lbs: '' },
      { name: 'Battle Ropes', sets: 4, reps: 30, weight_lbs: '' },
    ],
  },
];
