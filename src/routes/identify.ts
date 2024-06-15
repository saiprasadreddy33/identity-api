import { Router } from 'express';
import Contact, { IContact } from '../models/Contact';
import { Types } from 'mongoose';

const router = Router();

router.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phoneNumber must be provided' });
    }

    // Find existing contacts
    const existingContacts = await Contact.find({ $or: [{ email }, { phoneNumber }] }).sort({ createdAt: 1 });

    let primaryContact: IContact | null = null;
    let secondaryContactIds: number[] = [];

    // If no existing contacts, create a new primary contact
    if (existingContacts.length === 0) {
      primaryContact = new Contact({
        email,
        phoneNumber,
        linkPrecedence: 'primary',
      });
      await primaryContact.save();
    } else {
      // The oldest contact is considered the primary one
      primaryContact = existingContacts[0];

      // Check if a secondary contact needs to be created
      if (existingContacts.length > 1) {
        for (let i = 1; i < existingContacts.length; i++) {
          const existingContact = existingContacts[i];
          if (existingContact.email !== primaryContact.email || existingContact.phoneNumber !== primaryContact.phoneNumber) {
            // Create a secondary contact if there's new information
            const newSecondaryContact = new Contact({
              email: existingContact.email,
              phoneNumber: existingContact.phoneNumber,
              linkPrecedence: 'secondary',
              linkedId: primaryContact._id as unknown as Types.ObjectId,
            });
            await newSecondaryContact.save();
            secondaryContactIds.push(newSecondaryContact._id as unknown as number);
          }
        }
      }
    }

    // Find all linked contacts
    const linkedContacts = await Contact.find({ linkedId: primaryContact?._id });

    // Consolidate email and phone numbers
    const emails = Array.from(new Set([primaryContact?.email, ...linkedContacts.map(c => c.email)]));
    const phoneNumbers = Array.from(new Set([primaryContact?.phoneNumber, ...linkedContacts.map(c => c.phoneNumber)]));

    // Response
    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact?._id,
        emails: emails.filter(Boolean),
        phoneNumbers: phoneNumbers.filter(Boolean),
        secondaryContactIds,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
