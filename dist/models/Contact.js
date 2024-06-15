"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const contactSchema = new mongoose_1.Schema({
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    linkedId: { type: mongoose_1.Schema.Types.ObjectId, required: false },
    linkPrecedence: { type: String, required: true, enum: ['primary', 'secondary'] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, required: false }
});
const Contact = (0, mongoose_1.model)('Contact', contactSchema);
exports.default = Contact;
