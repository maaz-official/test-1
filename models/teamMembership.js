import mongoose from 'mongoose';

// Constants for Role and Status Enums
const ROLES = ['captain', 'player', 'substitute'];
const STATUSES = ['active', 'inactive', 'removed'];

// Schema Definition
const teamMembershipSchema = new mongoose.Schema(
  {
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: 'Role must be one of the following: ' + ROLES.join(', '),
      },
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be one of the following: ' + STATUSES.join(', '),
      },
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'joined_at', updatedAt: 'updated_at' }, // Auto-manage timestamps
  }
);

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

  const existingMembership = await this.findOne({ team_id: teamId, user_id: userId });
  if (existingMembership) {
    throw new Error('User is already a member of this team');
  }

  const membership = new this({ team_id: teamId, user_id: userId, role });
  return membership.save();
};

// Static Method to Remove Member by Updating Status
teamMembershipSchema.statics.removeMember = async function (membershipId) {
  return this.findByIdAndUpdate(membershipId, { status: 'removed' }, { new: true });
};

// Static Method to Restore Member by Updating Status
teamMembershipSchema.statics.restoreMember = async function (membershipId) {
  return this.findByIdAndUpdate(membershipId, { status: 'active' }, { new: true });
};

// Hook to log membership changes
teamMembershipSchema.post('save', function (doc) {
  console.log(`Membership updated: ${doc._id} - Status: ${doc.status}`);
});

// Export the TeamMembership Model
const TeamMembership = mongoose.model('TeamMembership', teamMembershipSchema);
export default TeamMembership;
