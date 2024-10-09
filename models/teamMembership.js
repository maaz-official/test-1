import mongoose from 'mongoose';

const teamMembershipSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  role: { type: String, enum: ['Captain', 'Player', 'Substitute'] },
  joined_at: { type: Date, default: Date.now },
});

// Relationships
teamMembershipSchema.virtual('team', { ref: 'Team', localField: 'team_id', foreignField: '_id', justOne: true });
teamMembershipSchema.virtual('user', { ref: 'User', localField: 'user_id', foreignField: '_id', justOne: true });

// Composite index for performance
teamMembershipSchema.index({ team_id: 1, user_id: 1 });

const TeamMembership = mongoose.model('TeamMembership', teamMembershipSchema);
export default TeamMembership;
