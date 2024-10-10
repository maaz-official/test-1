import mongoose from 'mongoose';

// Constants for Validations
const MAX_MEMBERS_LIMIT = 100; // Set a reasonable limit for max members

// Schema Definition
const teamSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  max_members: {
    type: Number,
    required: true,
    min: 1,
    max: MAX_MEMBERS_LIMIT,
  },
  min_members: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: function (v) {
        return v <= this.max_members;
      },
      message: 'Minimum members cannot exceed maximum members',
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Pre-save Hook to Update Timestamps
teamSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Relationships
teamSchema.virtual('memberships', {
  ref: 'TeamMembership',
  localField: '_id',
  foreignField: 'team_id',
});

teamSchema.virtual('event', {
  ref: 'Event',
  localField: 'event_id',
  foreignField: '_id',
  justOne: true,
});

// Composite index for performance
teamSchema.index({ event_id: 1, name: 1 });

// Static Method to Get Team by Event
teamSchema.statics.getTeamsByEvent = async function (eventId) {
  return this.find({ event_id: eventId }).populate('memberships');
};

// Static Method to Create a New Team with Validation
teamSchema.statics.createTeam = async function (eventId, name, maxMembers, minMembers) {
  if (maxMembers < minMembers) {
    throw new Error('Maximum members must be greater than or equal to minimum members');
  }

  const team = new this({ event_id: eventId, name, max_members: maxMembers, min_members: minMembers });
  return team.save();
};

// Static Method to Update Team Information
teamSchema.statics.updateTeam = async function (teamId, updates) {
  return this.findByIdAndUpdate(teamId, updates, { new: true, runValidators: true });
};

// Export the Team Model
const Team = mongoose.model('Team', teamSchema);
export default Team;
