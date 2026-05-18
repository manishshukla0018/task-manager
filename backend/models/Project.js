import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

projectSchema.pre('save', function (next) {
  if (!this.members.some((m) => m.toString() === this.adminId.toString())) {
    this.members.push(this.adminId);
  }
  next();
});

export default mongoose.model('Project', projectSchema);
