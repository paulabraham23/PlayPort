/**
 * PlayPort legal documents (from the signed-off PDFs dated 26/10/2026).
 * Bump LEGAL_VERSION whenever any document changes — checkout records which
 * version the customer accepted, and the server rejects stale versions.
 */
export const LEGAL_VERSION = '2026-10-26';
export const LEGAL_UPDATED = '26/10/2026';

export const BUSINESS = {
  name: 'PlayPort',
  address: 'Kachiguda, Hyderabad, Telangana – 500027',
  phone: '6300034574',
  email: 'playportofficial@gmail.com',
  website: 'https://playport-one.vercel.app',
  grievanceOfficer: 'Yuvraj Rathi, Founder',
  failedDeliveryFee: 150,
} as const;

export type LegalBlock =
  | { h: string }
  | { p: string }
  | { list: string[] }
  | { table: { head: [string, string]; rows: [string, string][] } };

export type LegalDoc = {
  slug: 'terms' | 'privacy' | 'refunds';
  title: string;
  short: string;
  blocks: LegalBlock[];
};

const contactBlock: LegalBlock = {
  p: `Grievance Officer: ${BUSINESS.grievanceOfficer}\nEmail: ${BUSINESS.email}\nPhone / WhatsApp: ${BUSINESS.phone}\nAddress: ${BUSINESS.address}`,
};

export const TERMS: LegalDoc = {
  slug: 'terms',
  title: 'Terms & Conditions',
  short: 'Terms',
  blocks: [
    {
      p: 'These Terms & Conditions ("Terms") apply to every booking, rental, delivery, installation, collection and return of gaming and entertainment equipment offered by PlayPort ("PlayPort", "we", "us"). By placing a booking, paying, accepting delivery, or ticking the acceptance box or confirming on WhatsApp, the customer ("Customer", "you") agrees to these Terms. Please read them before booking.',
    },
    { h: '1. Definitions' },
    {
      list: [
        '1.1. Equipment means any item supplied by PlayPort for rental, including PlayStation 5, PlayStation 4, controllers, VR headsets, racing wheels, projectors, games, cables, chargers and other accessories.',
        '1.2. Booking means a confirmed reservation of Equipment and related services.',
        '1.3. Rental Period means the period stated in the booking confirmation, invoice or WhatsApp confirmation.',
        '1.4. Rental Charges means the price agreed for the selected Equipment and Rental Period.',
        '1.5. Delivery Address means the address you give and PlayPort confirms for delivery, installation and collection.',
        '1.6. Handover Record means the photos, video, checklist, invoice, WhatsApp messages or signature that record what Equipment was supplied and in what condition, at delivery and at collection.',
        '1.7. Schedule A means the Schedule of Charges at the end of these Terms, which forms part of these Terms.',
      ],
    },
    { h: '2. Who Can Book, ID and Verification' },
    {
      list: [
        '2.1. The person making the Booking must be 18 or older and legally able to enter into a contract under Indian law. This person is the Customer and is responsible for the Equipment and for these Terms.',
        '2.2. People under 18 may use the Equipment, but only under the supervision of the Customer. The Customer remains fully responsible for the Equipment, for the conduct of anyone using it, and for any charges under these Terms.',
        '2.3. Before delivery, the Customer must provide one valid government photo ID (for example a driving licence, passport, voter ID, or masked Aadhaar) and confirm the Delivery Address. The Customer may choose which ID to provide. PlayPort may ask to see the original ID at delivery to match it with the name on the Booking.',
        '2.4. If ID or address cannot be verified, PlayPort may refuse delivery and treat the Booking as cancelled under Section 10.',
        '2.5. You must give accurate and current information, including your name, phone number, Delivery Address and payment details. You must not use another person\u2019s identity or documents without lawful authority.',
        '2.6. PlayPort may decline or cancel a Booking if information is false, verification fails, payment is not made, or we reasonably suspect fraud or misuse. Any refund will follow Section 10.',
      ],
    },
    { h: '3. Booking and Confirmation' },
    {
      list: [
        '3.1. You can book through the PlayPort website, WhatsApp, Instagram, phone or any other official PlayPort channel.',
        '3.2. A booking request is not a confirmed Booking until PlayPort confirms it and records the Equipment, Rental Period, price and Delivery Address.',
        '3.3. Availability, prices, offers and delivery times are subject to confirmation.',
        '3.4. Please check your booking confirmation and tell us straight away about any mistake.',
        '3.5. Changes to Equipment, Rental Period, address or price count only once PlayPort confirms them in writing (WhatsApp or email is enough).',
        '3.6. PlayPort will not swap your Equipment for materially different Equipment without telling you and getting your agreement.',
        '3.7. Electronic acceptance. Ticking the acceptance box on the website, confirming on WhatsApp, or accepting delivery counts as your agreement to these Terms. PlayPort keeps a record of the date and time of acceptance. Electronic acceptance is valid under the Information Technology Act, 2000.',
      ],
    },
    { h: '4. Pricing and Payment' },
    {
      list: [
        '4.1. The Rental Charges, delivery or collection fees, taxes (including GST where applicable) and any other fees will be shown to you before you confirm the Booking. PlayPort will not add hidden charges.',
        '4.2. Payment is due in full before the Equipment is handed over. You can pay online in advance, or by cash or UPI at the door on delivery ("Cash on Delivery" or "COD").',
        '4.3. For COD orders, PlayPort will not hand over or install the Equipment until payment is received. If you do not pay at the door, PlayPort may cancel the Booking and take the Equipment back. A failed-delivery fee may apply under Section 6.5 and Schedule A.',
        '4.4. PlayPort does not take a security deposit. This does not reduce your responsibility under Sections 7, 8 and 9.',
        '4.5. PlayPort will give you an invoice or receipt for each Booking (a WhatsApp message is enough). Please keep it for your records.',
        '4.6. Any change to the price of an accepted Booking needs your agreement, except where the law permits otherwise.',
      ],
    },
    { h: '5. Rental Period, Late Return and Extensions' },
    {
      list: [
        '5.1. The Rental Period starts and ends at the times shown in the booking confirmation or Handover Record.',
        '5.2. You must make the Equipment ready for collection, or return it as agreed, by the end of the Rental Period.',
        '5.3. There is a 30-minute grace period after the Rental Period ends. After that, the late fee in Schedule A applies for each hour or part of an hour until the Equipment is made available for collection.',
        '5.4. To extend, you must ask PlayPort before the Rental Period ends. An extension is valid only once PlayPort confirms availability and the extra charge in writing. Using the Equipment longer does not automatically count as an approved extension.',
        '5.5. If collection is late because of PlayPort\u2019s own scheduling or operations, you will not be charged for that delay.',
      ],
    },
    { h: '6. Delivery, Installation, Collection and Handover' },
    {
      list: [
        '6.1. PlayPort delivers, installs and collects the Equipment at the Delivery Address as stated in the Booking. Delivery times we quote are estimates and are not guaranteed.',
        '6.2. You must give correct access instructions and make sure you or an authorised adult is present at the Delivery Address at the agreed time.',
        '6.3. At delivery, PlayPort will record the Equipment, serial numbers, accessories and condition in the Handover Record, using photos, video, a checklist, or WhatsApp. Please check the Equipment with us and report any visible damage, missing item or fault straight away, and in any case within 30 minutes of setup.',
        '6.4. At collection, PlayPort will check the Equipment against the Handover Record, ideally in front of you, and record its condition again.',
        '6.5. If delivery or collection fails because of a wrong address, nobody being available, no access, refusal to pay or refusal to show ID, a failed-delivery fee applies as shown in Schedule A. This fee is disclosed before you confirm the Booking.',
        '6.6. PlayPort will tell you about any delay and try to arrange a new time.',
        '6.7. You must not knowingly make a false claim that Equipment was not delivered, was delivered damaged, or was returned when it was not.',
      ],
    },
    { h: '7. Your Responsibility for the Equipment' },
    {
      list: [
        '7.1. The Equipment always belongs to PlayPort or its lawful owner. You get temporary permission to use it during the Rental Period.',
        '7.2. You are responsible for the Equipment from the time of handover until PlayPort completes collection and checks it.',
        '7.3. Use the Equipment carefully, for its intended purpose and as the manufacturer instructs. Keep it indoors at the Delivery Address, protected from theft, loss, spills, heat, impact, electrical damage and misuse. Do not take it elsewhere unless PlayPort agrees.',
        '7.4. Do not sell, pledge, lend, sub-rent, hand over or dispose of the Equipment.',
        '7.5. Do not remove, hide or tamper with serial numbers, labels or markings.',
        '7.6. Do not open, repair, modify, jailbreak or try to bypass security on the Equipment.',
        '7.7. Do not use the Equipment for anything unlawful or in a way likely to cause damage or injury.',
        '7.8. Tell PlayPort immediately if the Equipment is lost, stolen, damaged, not working properly, or accessed by someone not authorised.',
        '7.9. Normal wear and tear from reasonable use is not your responsibility.',
      ],
    },
    { h: '8. Damage, Loss and Missing Accessories' },
    {
      list: [
        '8.1. You are responsible for damage, loss or missing accessories caused during the period of your responsibility by you, anyone using the Equipment with you, or anyone at the Delivery Address, to the extent it results from a breach of these Terms, carelessness or misuse.',
        '8.2. You are not responsible for damage that was already there (as shown in the Handover Record), normal wear and tear, or a fault that was not caused by you.',
        '8.3. Repairable damage: you pay the actual and reasonable cost of repair, supported by a repair estimate or invoice. This will never be more than the amount for that item in Schedule A.',
        '8.4. Lost, stolen or beyond economic repair: you pay the amount for that item in Schedule A. These amounts are based on the approximate value of used Equipment of that kind, not the price of a new item, and not the full cost of a replacement in every case.',
        '8.5. Missing accessories (cables, chargers, remotes, etc.): you pay the amount in Schedule A for each missing item.',
        '8.6. PlayPort will assess any claim fairly, using the Handover Record, photos, diagnostics, repair estimates and invoices. On request, PlayPort will explain the claim and share the supporting evidence.',
        '8.7. PlayPort will not charge twice for the same loss. If PlayPort recovers money through warranty or insurance, that amount will be deducted from your charge.',
        '8.8. Please pay any valid claim within 7 days of receiving PlayPort\u2019s written claim with supporting evidence. You may dispute a claim by writing to PlayPort, and we will respond fairly.',
        '8.9. Not signing a damage report does not by itself make you liable or free you from liability. Responsibility will be decided on the available evidence and the law.',
        '8.10. Nothing in this Section removes any right you have under applicable law.',
      ],
    },
    { h: '9. Non-Return, Suspected Theft and Unauthorised Retention' },
    {
      list: [
        '9.1. You must return the Equipment, or make it available for the agreed collection, by the end of the Rental Period (plus the grace period).',
        '9.2. If the Equipment is overdue, PlayPort may contact you by phone, WhatsApp or email and send a written request to return it.',
        '9.3. If the Equipment is still not returned 72 hours after the end of the Rental Period and you have not been in touch to arrange a return, PlayPort may treat it as unreturned. PlayPort may then charge the outstanding Rental Charges, late fees, and the Schedule A amount for each unreturned item, and may take lawful steps to recover the Equipment or its value.',
        '9.4. Where there is credible evidence of theft, fraud, deliberate hiding of the Equipment or other unlawful conduct, PlayPort may report the matter to the police or other authorities and cooperate with any lawful investigation.',
        '9.5. A late return, a payment disagreement or a communication problem is not, by itself, a crime. PlayPort will not make knowingly false accusations, use threats or harassment, or use unlawful recovery methods.',
        '9.6. PlayPort will not enter your home or take property without lawful authority or your consent.',
        '9.7. Any request for return or payment will identify the Booking and explain the basis of the claim.',
      ],
    },
    { h: '10. Cancellations, Rescheduling and Refunds' },
    {
      list: [
        '10.1. You may cancel or reschedule through any official PlayPort channel (WhatsApp, phone, email or website).',
        '10.2. Free cancellation or rescheduling is available until PlayPort dispatches the Equipment for delivery. After dispatch, the failed-delivery fee in Schedule A may apply, and PlayPort will tell you before charging it.',
        '10.3. Refunds for eligible cancellations will be sent to the original payment method within 7 working days, subject to payment-provider timelines.',
        '10.4. If PlayPort cannot fulfil a confirmed Booking for a reason on our side, you will be offered a full refund or another solution you agree to.',
        '10.5. If the Equipment arrives materially defective, is not as agreed, or becomes unusable through no fault of yours, tell PlayPort promptly. PlayPort will assess the issue and offer a fair remedy, such as troubleshooting, replacement, repair, a proportionate refund or cancellation.',
        '10.6. If a Booking is cancelled under Section 2.4 or 2.6 because you could not provide valid ID or because information was false, PlayPort may keep the failed-delivery fee but will refund the rest of any prepaid amount.',
        '10.7. Nothing in these Terms overrides a right you have under law.',
      ],
    },
    { h: '11. Equipment Faults and Technical Support' },
    {
      list: [
        '11.1. PlayPort will take reasonable steps to supply Equipment that works and suits the agreed purpose at handover.',
        '11.2. Report any fault promptly and give the information we need to diagnose it. Do not attempt repairs or modifications yourself.',
        '11.3. PlayPort may help by troubleshooting, remote support, repair, replacement or another suitable remedy.',
        '11.4. PlayPort is not responsible for faults or interruptions caused by your misuse, unsuitable power supply or third-party equipment, your internet connection, outages of third-party services, or other things outside our reasonable control, except where the law says otherwise.',
      ],
    },
    { h: '12. Safe Use' },
    {
      list: [
        '12.1. Use the Equipment in a safe place and follow the manufacturer\u2019s instructions and age recommendations.',
        '12.2. VR headsets and motion-controlled Equipment must be used in a clear space away from stairs, sharp objects, fragile items, glass and other hazards.',
        '12.3. Children must be supervised by an adult at all times when using the Equipment.',
        '12.4. Stop using the Equipment immediately if it seems electrically unsafe, damaged or hazardous, and tell PlayPort.',
        '12.5. PlayPort does not guarantee uninterrupted access to online gaming networks, multiplayer services, subscriptions or digital content.',
        '12.6. You must follow the law and the terms of the relevant platform or game when using third-party services.',
      ],
    },
    { h: '13. Games, Accounts and Digital Content' },
    {
      list: [
        '13.1. Only the games, accounts, subscriptions and accessories named in your Booking are included.',
        '13.2. Do not make purchases, start subscriptions, change passwords or change settings on any PlayPort account or payment method.',
        '13.3. Do not install, copy or use pirated games or software, and do not jailbreak, mod or bypass the security of any Equipment.',
        '13.4. If you sign in to your own accounts, you must sign out before returning the Equipment. PlayPort will factory-reset or clear user data on return, and is not responsible for any saves, accounts or data you leave behind.',
        '13.5. Do not use anyone else\u2019s account without permission, or use the Equipment in a way that breaks platform rules.',
        '13.6. You should not expect permanent access to any particular game, service or subscription unless the Booking says so.',
        '13.7. If an unauthorised purchase or account misuse happens, responsibility will be decided on the available evidence and the law.',
      ],
    },
    { h: '14. Personal Data and Privacy' },
    {
      list: [
        '14.1. PlayPort collects only the personal information it needs to manage Bookings, take payments, deliver and collect Equipment, verify identity, give support, prevent fraud and meet legal duties. This includes your name, phone number, address, ID proof, booking and payment records, and Handover Record photos or video.',
        '14.2. Your ID proof is used only to verify your identity and Delivery Address and to deal with disputes, theft or fraud. We keep it only as long as needed, and normally delete it within 90 days after the Booking ends and all dues are settled, unless there is an open dispute, a legal duty to keep it, or a police matter.',
        '14.3. PlayPort does not sell your personal information and does not use it for unrelated purposes without a lawful basis.',
        '14.4. PlayPort collects information only from the Customer (18 or older). Please do not give us personal information about children.',
        '14.5. PlayPort\u2019s separate Privacy Policy explains in detail what we collect, why, who we share it with, how long we keep it, how we protect it, and how you can withdraw consent, ask for correction or erasure, or complain. It forms part of these Terms.',
        `14.6. To raise a privacy concern or use your rights, contact ${BUSINESS.email}.`,
      ],
    },
    { h: '15. Indemnity' },
    {
      list: [
        '15.1. To the extent the law permits, you agree to compensate PlayPort for loss, damage or claims from third parties caused by your breach of these Terms, your misuse of the Equipment, or the actions of anyone using it with you or at the Delivery Address.',
        '15.2. This Section does not apply to loss caused by PlayPort\u2019s own fault, fraud or wilful misconduct.',
      ],
    },
    { h: '16. Limitation of Liability' },
    {
      list: [
        '16.1. PlayPort will take reasonable care when handling Bookings, supplying Equipment and providing services.',
        '16.2. To the extent the law permits, PlayPort is not liable for indirect or unforeseeable losses, and PlayPort\u2019s total liability to you for any Booking is limited to the Rental Charges you paid for that Booking.',
        '16.3. Nothing in these Terms excludes or limits liability for fraud, wilful misconduct, death or personal injury caused by negligence, or any liability that cannot lawfully be excluded.',
        '16.4. Nothing in these Terms removes your rights under consumer protection law, including the Consumer Protection Act, 2019. Any limit applies only to the extent the law allows.',
      ],
    },
    { h: '17. Events Beyond Our Control' },
    {
      list: [
        '17.1. Neither of us is in breach because of an extraordinary event beyond reasonable control, such as a severe natural disaster, government restriction, public emergency or widespread infrastructure failure, as long as we promptly tell the other and take reasonable steps to reduce its effect.',
        '17.2. This does not excuse payments already due, negligence, preventable failures, or duties that the law requires us to perform.',
        '17.3. If PlayPort cannot fulfil a Booking because of such an event, we will offer a reasonable alternative or a refund.',
      ],
    },
    { h: '18. Complaints and Grievance Redressal' },
    {
      p: '18.1. You can raise a complaint about a Booking, Equipment, payment, delivery, refund, damage claim or privacy through the contact details below. Please share your name, booking details, the date, what went wrong, and any photos or messages.',
    },
    contactBlock,
    {
      list: [
        '18.2. PlayPort will acknowledge your complaint within 2 working days and aims to resolve it within 30 days, or sooner if the law requires.',
        '18.3. You keep the right to approach the consumer commission, regulator or any other competent authority where the law allows.',
      ],
    },
    { h: '19. Suspension and Refusal of Service' },
    {
      list: [
        '19.1. PlayPort may refuse future Bookings or suspend service where reasonably necessary because of suspected fraud, serious breach of these Terms, non-payment, repeated non-return of Equipment, or a safety concern.',
        '19.2. Any action will be fair to the situation and consistent with the law.',
        '19.3. Suspension does not cancel duties that already arose, such as returning Equipment and paying valid charges.',
        '19.4. PlayPort will not use suspension to avoid a refund or remedy that is legally due to you.',
      ],
    },
    { h: '20. Changes to These Terms' },
    {
      list: [
        '20.1. PlayPort may update these Terms to reflect changes in its services, business or the law.',
        '20.2. The latest version, with its "Last updated" date, will be shown on the website.',
        '20.3. New Terms apply to future Bookings. They do not change a confirmed Booking unless you agree or the law allows it.',
        '20.4. Where the law requires, PlayPort will give notice of material changes.',
      ],
    },
    { h: '21. Governing Law and Disputes' },
    {
      list: [
        '21.1. These Terms are governed by the laws of India.',
        '21.2. We will first try to resolve any dispute through honest, good-faith discussion.',
        '21.3. If a dispute is not resolved, the courts at Hyderabad, Telangana will have jurisdiction, subject to your right to approach a consumer commission or other forum that the law gives you.',
      ],
    },
    { h: '22. General' },
    {
      list: [
        '22.1. Whole agreement. These Terms, your Booking confirmation, Schedule A and the Privacy Policy make up the agreement between you and PlayPort for that Booking.',
        '22.2. If a part is invalid. If any part of these Terms is found invalid or unenforceable, the rest stays in force.',
        '22.3. No waiver. If PlayPort does not enforce a right straight away, it does not lose that right.',
        '22.4. Notices. PlayPort may send notices and claims by WhatsApp, SMS, phone or email to the contact details you gave, and these count as delivered when sent.',
        '22.5. No transfer. You may not transfer your Booking or your rights under these Terms to anyone else without PlayPort\u2019s written consent.',
      ],
    },
    { h: 'Schedule A – Schedule of Charges' },
    {
      p: 'These amounts are shown to you before you confirm your Booking. They apply as set out in Sections 4, 5, 6, 8 and 9. For repairable damage, you pay actual reasonable repair cost up to the amount shown (see Section 8.3). PlayPort does not charge a security deposit.',
    },
    {
      table: {
        head: ['Item', 'Lost, stolen or beyond economic repair'],
        rows: [
          ['PS5 console', '₹60,000'],
          ['PS5 controller', '₹6,000'],
          ['PS4 console', '₹20,000'],
          ['PS4 controller', '₹3,000'],
          ['Meta Quest 2 VR headset (with controllers)', '₹20,000'],
          ['Racing wheel set', '₹22,000'],
          ['Projector', '₹15,000'],
          ['HDMI cable', '₹500'],
          ['Power cable', '₹500'],
          ['Charging cable', '₹500'],
          ['Remote', '₹1,000'],
        ],
      },
    },
    {
      table: {
        head: ['Other charges', 'Amount'],
        rows: [
          ['Late fee (after 30-minute grace)', 'The normal hourly rental rate for that item, per hour or part of an hour'],
          ['Failed-delivery or failed-collection fee (see Section 6.5)', `₹${BUSINESS.failedDeliveryFee}`],
        ],
      },
    },
  ],
};

export const PRIVACY: LegalDoc = {
  slug: 'privacy',
  title: 'Privacy Policy',
  short: 'Privacy',
  blocks: [
    {
      p: 'PlayPort rents gaming and entertainment equipment (such as PlayStation consoles, VR headsets, racing wheels and projectors) and delivers it to your home. This Privacy Policy explains what personal information we collect, why we collect it, how we use and protect it, how long we keep it, and what choices and rights you have. We follow the Digital Personal Data Protection Act, 2023 and the rules made under it. This Policy forms part of PlayPort\u2019s Terms & Conditions.',
    },
    {
      p: 'By making a Booking, sharing your details, or ticking the acceptance box on our website or confirming on WhatsApp, you agree to the use of your information as described here. If you do not agree, please do not book with us.',
    },
    { h: '1. Who We Are' },
    {
      p: 'PlayPort is the "Data Fiduciary" for your personal information, which means we decide why and how it is used. You can reach us at the contact details below.',
    },
    { h: '2. What Information We Collect' },
    { p: 'We collect only what we need to run your Booking.' },
    {
      table: {
        head: ['What we collect', 'Why we need it'],
        rows: [
          [
            'Contact details — name, phone number, WhatsApp number, email (if you give it)',
            'To confirm and manage your Booking and contact you',
          ],
          [
            'Delivery details — delivery address, access instructions, location pin if you share it',
            'To deliver, install and collect the Equipment',
          ],
          [
            'Identity proof — one valid government photo ID of your choice, such as a driving licence, passport, voter ID or masked Aadhaar',
            'To verify who is renting and to prevent theft and fraud',
          ],
          [
            'Booking and payment records — Equipment booked, dates, price, invoice, UPI or payment reference, cash received',
            'To process payment, issue invoices and meet tax and accounting rules',
          ],
          [
            'Handover records — photos, video, checklists and WhatsApp confirmations of the Equipment\u2019s condition at delivery and pickup',
            'To record condition and resolve damage or loss disputes',
          ],
          [
            'Messages — chats, calls, emails and feedback forms with us',
            'To give support, handle complaints and improve our service',
          ],
          [
            'Website information — pages visited, cart contents, device and browser type, and basic usage data',
            'To make the website work and to understand how it is used',
          ],
        ],
      },
    },
    {
      p: 'We do not collect or store your card number, bank account number, UPI PIN or passwords. Payments are handled by your payment app or the payment provider.',
    },
    { h: '3. How We Use Your Information' },
    { p: 'We use your information only for these purposes:' },
    {
      list: [
        '1. To confirm, deliver, install, collect and manage your Booking.',
        '2. To verify your identity and delivery address.',
        '3. To take payment and issue invoices.',
        '4. To check the condition of Equipment and handle damage, loss, late-return or non-return claims.',
        '5. To prevent, detect and deal with fraud, theft and misuse.',
        '6. To answer your questions, give technical support and handle complaints.',
        '7. To send you messages about your Booking, such as confirmations, delivery updates and reminders.',
        '8. To meet legal, tax and accounting obligations.',
        '9. To improve our service, for example through feedback forms.',
      ],
    },
    {
      p: 'We will send you offers or promotions only if you have agreed to receive them. You can say stop at any time. We will not use your information for any other purpose without asking you first, unless the law allows or requires it.',
    },
    { h: '4. Your Consent' },
    {
      list: [
        '4.1. We collect and use your personal information with your consent, which you give when you make a Booking, share your details or accept our Terms. Your consent is free, specific and informed, and covers the purposes listed above.',
        '4.2. You can withdraw your consent at any time as easily as you gave it, by messaging or emailing us. Withdrawing consent does not affect what we did before you withdrew. If you withdraw consent for information we need to run your Booking (such as your ID or address), we may not be able to continue the Booking or accept future Bookings.',
        '4.3. Some information we may still keep after you withdraw consent where the law requires it, for example invoices and payment records, or where there is an open dispute or a police matter.',
      ],
    },
    { h: '5. Who We Share Your Information With' },
    { p: 'We do not sell your personal information. We share it only where needed:' },
    {
      list: [
        'Delivery and installation staff or partners, who get only the name, phone number, address and Booking details needed to complete delivery and pickup.',
        'Payment providers and apps (such as UPI apps and payment gateways), to take and confirm payment.',
        'Technology and service providers, such as messaging platforms (WhatsApp), website hosting and analytics services, and cloud storage, which handle information on our behalf and are required to protect it.',
        'Repair centres or insurers, if Equipment is damaged or lost and we need their help to assess or claim, limited to what is needed.',
        'Police, courts or government authorities, where the law requires it or where there is credible evidence of theft, fraud or other unlawful conduct.',
      ],
    },
    {
      p: 'Some of these providers may store information on servers outside India. We choose providers who use reasonable security safeguards.',
    },
    { h: '6. How Long We Keep Your Information' },
    {
      table: {
        head: ['Information', 'How long we keep it'],
        rows: [
          ['ID proof', 'Normally deleted within 90 days after your Booking ends and all dues are settled'],
          ['Handover photos, video and checklists', 'Normally deleted within 90 days after your Booking ends and all dues are settled'],
          ['Invoices and payment records', 'For the period required by tax and accounting law'],
          ['Messages and support records', 'For as long as needed to deal with your request or complaint, then deleted or anonymised'],
          ['Website usage data', 'For a limited period, then deleted or anonymised'],
        ],
      },
    },
    {
      p: 'We keep information longer only where there is an open dispute, a claim, a police matter or a legal duty to keep it. When the time is up, we delete it or make it anonymous.',
    },
    { h: '7. How We Protect Your Information' },
    { p: 'We use reasonable security safeguards to protect your information, including:' },
    {
      list: [
        'keeping ID copies and handover records in restricted, password-protected storage;',
        'giving access only to people who need it to handle your Booking;',
        'using secure, reputable service providers;',
        'not keeping ID photos in public chats, public folders or shared groups.',
      ],
    },
    {
      p: 'If there is a personal data breach that affects you, we will tell you and the Data Protection Board of India as the law requires, and take steps to reduce harm. No system is completely secure, but we take this seriously and review how we handle data as PlayPort grows.',
    },
    { h: '8. Children\u2019s Information' },
    {
      p: 'Only a person aged 18 or older can make a Booking with PlayPort. People under 18 may use the Equipment under the supervision of the adult who booked it, but we do not collect personal information from children and we do not knowingly process a child\u2019s personal data. Please do not give us personal information about a child, such as their ID. If you believe a child\u2019s information has reached us, contact us and we will delete it.',
    },
    { h: '9. Your Rights' },
    { p: 'Under the Digital Personal Data Protection Act, 2023, you have the right to:' },
    {
      list: [
        'Know what personal information we hold about you and how it is being used;',
        'Correct or update information that is wrong or incomplete;',
        'Ask us to erase your information, where we no longer need it for the purpose or to meet a legal duty;',
        'Withdraw your consent at any time (see Section 4);',
        'Raise a grievance if you are unhappy with how we handle your information;',
        'Nominate another person to exercise your rights if you die or cannot act for yourself.',
      ],
    },
    {
      p: 'To use any of these rights, message or email us from the number or email address linked to your Booking so we can confirm it is you. We will acknowledge your request within 2 working days and aim to complete it within 30 days, or sooner if the law requires.',
    },
    { h: '10. Complaints and Grievance Redressal' },
    { p: 'If you have a concern about your personal information, please contact us first:' },
    contactBlock,
    {
      p: 'We will acknowledge your complaint within 2 working days and aim to resolve it within 30 days. If you are not satisfied with our response, you may complain to the Data Protection Board of India, as provided under the Digital Personal Data Protection Act, 2023.',
    },
    { h: '11. Cookies and Website Data' },
    {
      p: 'Our website may use cookies or similar tools that are necessary for it to work, such as keeping items in your cart, and, if we enable them, basic analytics to understand how the site is used. You can control or delete cookies in your browser settings. If we add advertising or tracking tools in future, we will update this Policy and ask for your consent where the law requires.',
    },
    { h: '12. Links to Other Websites' },
    {
      p: 'Our website or messages may link to other websites or apps, such as payment apps or social media. We are not responsible for how they handle your information. Please read their privacy policies.',
    },
    { h: '13. Changes to This Policy' },
    {
      p: 'We may update this Policy when our services, business or the law changes. The latest version, with its "Last updated" date, will always be on our website. If we make an important change to how we use your information, we will tell you and ask for your consent again where the law requires.',
    },
    { h: '14. Contact Us' },
    {
      p: `For any question about this Privacy Policy or your information, contact PlayPort at ${BUSINESS.email} or ${BUSINESS.phone} (call or WhatsApp).`,
    },
  ],
};

export const REFUNDS: LegalDoc = {
  slug: 'refunds',
  title: 'Refund & Cancellation Policy',
  short: 'Refunds',
  blocks: [
    {
      p: 'This Policy explains how cancellations, rescheduling and refunds work at PlayPort. It forms part of PlayPort\u2019s Terms & Conditions. Nothing here reduces any right you have under Indian consumer law.',
    },
    { h: '1. At a Glance' },
    {
      table: {
        head: ['Situation', 'What happens'],
        rows: [
          ['You cancel or reschedule before we dispatch', 'Free. Full refund of anything you paid.'],
          [
            'You cancel after dispatch but before we reach you',
            `Refund of what you paid, minus the failed-delivery fee (₹${BUSINESS.failedDeliveryFee}) if we had already set out. We tell you before charging it.`,
          ],
          [
            'You are not available, wrong address, refuse to pay, or cannot show valid ID at delivery',
            `Booking cancelled. Failed-delivery fee of ₹${BUSINESS.failedDeliveryFee} applies. The rest of any prepaid amount is refunded.`,
          ],
          ['We cancel or cannot deliver', 'Full refund, or a new slot or alternative you agree to. No fee.'],
          ['Equipment arrives faulty or not as booked', 'Fix, swap, partial refund or full refund (see Section 5).'],
          ['You return early or stop using it', 'No refund for unused time, unless we agree otherwise.'],
          ['Change of mind after handover', 'No refund, but you may cancel before handover under the rules above.'],
        ],
      },
    },
    { h: '2. How to Cancel or Reschedule' },
    {
      list: [
        `2.1. Message us on WhatsApp at ${BUSINESS.phone}, call us, or email ${BUSINESS.email}. Please give your name, phone number and Booking details.`,
        '2.2. Your cancellation counts from the time we receive your message. We will confirm it in writing (WhatsApp is fine).',
        '2.3. Rescheduling is free until we dispatch the Equipment, subject to availability. After dispatch, rescheduling is treated as a cancellation and a new Booking.',
      ],
    },
    { h: '3. Cancellation by You' },
    {
      list: [
        '3.1. Before dispatch: free cancellation. You get a full refund of any amount you paid.',
        `3.2. After dispatch: we may charge a failed-delivery fee of ₹${BUSINESS.failedDeliveryFee} to cover the wasted trip. We will tell you before we charge it, and the fee is shown in Schedule A of our Terms & Conditions.`,
        `3.3. At the door: if you cancel or refuse the Equipment at delivery for no fault of PlayPort, the same ₹${BUSINESS.failedDeliveryFee} fee applies.`,
        `3.4. Cash on Delivery (COD): if you have not paid anything in advance, there is nothing to refund. If you do not pay at the door, we may cancel the Booking and take the Equipment back, and the ₹${BUSINESS.failedDeliveryFee} fee applies.`,
      ],
    },
    { h: '4. Cancellation by PlayPort' },
    { p: 'We may cancel a Booking if:' },
    {
      list: [
        'the Equipment is not available or has a fault we cannot fix in time;',
        'we cannot reach your address or complete delivery for reasons on our side;',
        'your ID or address cannot be verified, or the information you gave is false;',
        'payment is not received before handover;',
        'there is a safety concern, or we reasonably suspect fraud or misuse.',
      ],
    },
    {
      p: `If we cancel for a reason on our side, you get a full refund or a new slot or alternative that you agree to, and you pay no fee. If we cancel because your ID or address could not be verified or the information was false, the ₹${BUSINESS.failedDeliveryFee} fee may apply and the rest of any prepaid amount is refunded.`,
    },
    { h: '5. Faulty or Wrong Equipment' },
    {
      list: [
        '5.1. Please check the Equipment with us at delivery and tell us about any visible damage, missing item or fault straight away, and in any case within 30 minutes of setup.',
        '5.2. If the Equipment is faulty, not working properly, or not what you booked, and the problem is not caused by you, we will choose a fair remedy: troubleshooting by phone or on site; replacement with the same or equal Equipment, where available; partial refund for the time the Equipment could not be used; or a full refund if the Equipment is unusable from the start and we cannot replace it, and we collect it back.',
        '5.3. Problems that happen later in the Rental Period (for example, the console stops working) should be reported to us as soon as they happen. We will help in the same way. The refund, if any, will be for the time the Equipment could not be used because of our side of the fault.',
        '5.4. We do not give refunds for problems caused by misuse, your internet connection, your power supply, third-party equipment, or outages of online gaming services such as PlayStation Network. We will still try to help you troubleshoot.',
      ],
    },
    { h: '6. Late Start, Delays and Events Beyond Our Control' },
    {
      list: [
        '6.1. If we are late because of our own scheduling or operations, you will not be charged for the delay in collecting the Equipment (see Section 5.5 of our Terms).',
        '6.2. If we are very late, or we cannot deliver on the day, you may choose a new slot or a full refund.',
        '6.3. If a severe weather event, government restriction or other event beyond our control stops us from delivering, we will offer a new slot or a full refund.',
      ],
    },
    { h: '7. Early Return and Extensions' },
    {
      list: [
        '7.1. If you return the Equipment early, or stop using it before the Rental Period ends, we do not refund the unused time, unless we agree otherwise before you start.',
        '7.2. To extend, ask us before the Rental Period ends. An extension counts only once we confirm availability and the extra charge in writing.',
      ],
    },
    { h: '8. How Refunds Are Paid' },
    {
      list: [
        '8.1. Refunds go back to the original payment method wherever possible (for example, the UPI ID or account you paid from).',
        '8.2. We aim to send your refund within 7 working days of your cancellation or of us confirming the refund. Your bank or payment provider may take a few extra days to show it.',
        '8.3. If you paid by cash, we will refund by UPI or bank transfer to an account in your name, or return the cash if we are with you.',
        '8.4. We will tell you the amount and the date we sent it. If you have not received it after 10 working days, contact us and we will check it with our payment provider.',
      ],
    },
    { h: '9. Damage, Loss and Other Charges' },
    {
      p: 'Refunds are separate from charges for damage, loss, late return or missing items. Those are covered by Sections 5, 8 and 9 of our Terms & Conditions and Schedule A. If we have a valid claim against you, we will tell you the amount and the reason before taking any amount from a refund, and you can ask to see the evidence.',
    },
    { h: '10. Your Legal Rights' },
    {
      p: 'Nothing in this Policy takes away any right you have under law, including the Consumer Protection Act, 2019. If you are not happy with how we handled your cancellation or refund, you can use our grievance process (Section 11) or approach the consumer commission or any other authority that the law allows.',
    },
    { h: '11. Complaints' },
    { p: 'If you have a problem with a cancellation or refund, contact us first.' },
    contactBlock,
    { p: 'We will acknowledge your complaint within 2 working days and aim to resolve it within 30 days.' },
    { h: '12. Changes to This Policy' },
    {
      p: 'We may update this Policy from time to time. The latest version, with its "Last updated" date, will be on our website. Changes apply to future Bookings and do not change a confirmed Booking unless you agree or the law allows it.',
    },
  ],
};

export const LEGAL_DOCS = { terms: TERMS, privacy: PRIVACY, refunds: REFUNDS } as const;
