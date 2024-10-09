import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  name: { type: String, required: true },
  max_members: { type: Number, required: true },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});

// Relationships
teamSchema.virtual('memberships', { ref: 'TeamMembership', localField: '_id', foreignField: 'team_id' });
teamSchema.virtual('event', { ref: 'Event', localField: 'event_id', foreignField: '_id', justOne: true });

// Composite index for performance
teamSchema.index({ event_id: 1, name: 1 });

const Team = mongoose.model('Team', teamSchema);
export default Team;
