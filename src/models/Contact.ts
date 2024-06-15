import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContact extends Document {
  phoneNumber?: string;
  email?: string;
  linkedId?: Types.ObjectId; 
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const contactSchema = new Schema<IContact>({
  phoneNumber: { type: String },
  email: { type: String },
  linkedId: { type: Schema.Types.ObjectId }, 
  linkPrecedence: { type: String, enum: ['primary', 'secondary'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

const Contact = mongoose.model<IContact>('Contact', contactSchema);

export default Contact;
