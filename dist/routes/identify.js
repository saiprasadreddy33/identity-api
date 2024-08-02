"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Contact_1 = __importDefault(require("../models/Contact"));
const router = (0, express_1.Router)();
router.post('/identify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = req.body;
    try {
        if (!email && !phoneNumber) {
            return res.status(400).json({ error: 'Email or phoneNumber must be provided' });
        }
        // Find existing contacts
        const existingContacts = yield Contact_1.default.find({
            $or: [{ email }, { phoneNumber }]
        }).sort({ createdAt: 1 });
        let primaryContact = null;
        let secondaryContactIds = [];
        // If no existing contacts, create a new primary contact
        if (existingContacts.length === 0) {
            primaryContact = new Contact_1.default({
                email,
                phoneNumber,
                linkPrecedence: 'primary',
            });
            yield primaryContact.save();
        }
        else {
            // The oldest contact is considered the primary one
            primaryContact = existingContacts[0];
            // Check if a secondary contact needs to be created
            if (existingContacts.length > 1) {
                for (let i = 1; i < existingContacts.length; i++) {
                    const existingContact = existingContacts[i];
                    if (existingContact.email !== primaryContact.email || existingContact.phoneNumber !== primaryContact.phoneNumber) {
                        // Create a secondary contact if there's new information
                        const newSecondaryContact = new Contact_1.default({
                            email: existingContact.email,
                            phoneNumber: existingContact.phoneNumber,
                            linkPrecedence: 'secondary',
                            linkedId: primaryContact._id,
                        });
                        yield newSecondaryContact.save();
                        secondaryContactIds.push(newSecondaryContact._id);
                    }
                }
            }
        }
        // Find all linked contacts
        const linkedContacts = yield Contact_1.default.find({ linkedId: primaryContact === null || primaryContact === void 0 ? void 0 : primaryContact._id });
        // Consolidate email and phone numbers
        const emails = Array.from(new Set([primaryContact === null || primaryContact === void 0 ? void 0 : primaryContact.email, ...linkedContacts.map(c => c.email)]));
        const phoneNumbers = Array.from(new Set([primaryContact === null || primaryContact === void 0 ? void 0 : primaryContact.phoneNumber, ...linkedContacts.map(c => c.phoneNumber)]));
        // Response
        return res.status(200).json({
            contact: {
                primaryContactId: primaryContact === null || primaryContact === void 0 ? void 0 : primaryContact._id,
                emails: emails.filter((email) => !!email),
                phoneNumbers: phoneNumbers.filter((phoneNumber) => !!phoneNumber),
                secondaryContactIds: secondaryContactIds.filter((id) => !!id),
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
