import mongoose from 'mongoose';

// Constants for Role and Status Enums
const ROLES = ['captain', 'player', 'substitute'];
const STATUSES = ['active', 'inactive', 'removed'];

// Schema Definition
const teamMembershipSchema = new mongoose.Schema({
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ROLES,
    required: true, 
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'active',
    index: true,
  },
  joined_at: {
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
teamMembershipSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Relationships
teamMembershipSchema.virtual('team', {
  ref: 'Team',
  localField: 'team_id',
  foreignField: '_id',
  justOne: true,
});

teamMembershipSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

// Composite index for performance
teamMembershipSchema.index({ team_id: 1, user_id: 1, status: 1 });

// Static Method to Fetch Active Members of a Team
teamMembershipSchema.statics.getActiveMembers = async function (teamId) {
  return this.find({ team_id: teamId, status: 'active' }).populate('user');
};

// Static Method to Add Member with Role Validation
teamMembershipSchema.statics.addMember = async function (teamId, userId, role) {
  if (!ROLES.includes(role)) {
    throw new Error('Invalid role specified');
  }
  
  const membership = new this({ team_id: teamId, user_id: userId, role });
  return membership.save();
};

// Static Method to Remove Member by Updating Status
teamMembershipSchema.statics.removeMember = async function (membershipId) {
  return this.findByIdAndUpdate(membershipId, { status: 'removed' }, { new: true });
};

// Export the TeamMembership Model
const TeamMembership = mongoose.model('TeamMembership', teamMembershipSchema);
export default TeamMembership;
