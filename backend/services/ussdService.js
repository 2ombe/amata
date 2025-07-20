// services/ussdService.js
const USSD_SESSIONS = new Map();

class USSDSession {
  constructor(sessionId, phoneNumber) {
    this.sessionId = sessionId;
    this.phoneNumber = phoneNumber;
    this.step = 'welcome';
    this.data = {};
    this.createdAt = Date.now();
  }
}

async function handleUSSDRequest(sessionId, phoneNumber, text) {
  // Get or create session
  let session = USSD_SESSIONS.get(sessionId) || 
    new USSDSession(sessionId, phoneNumber);
  
  // Clear session if last interaction > 5 minutes ago
  if (Date.now() - session.createdAt > 300000) {
    session = new USSDSession(sessionId, phoneNumber);
  }
  
  // Process input
  const input = text ? text.split('*').slice(1) : [];
  let response;
  
  switch (session.step) {
    case 'welcome':
      response = `CON Welcome to MilkFlow Rwanda
1. Report milk ready
2. Check collection schedule
3. View payments
4. Emergency report`;
      session.step = 'main_menu';
      break;
      
    case 'main_menu':
      if (input[0] === '1') {
        response = `CON Enter milk amount in liters:`;
        session.step = 'report_amount';
      } 
      // ... other menu options
      break;
      
    case 'report_amount':
      const quantity = parseFloat(input[0]);
      if (!isNaN(quantity) {
        const farmer = await Farmer.findOne({ contact: { phone: phoneNumber } });
        await recordMilkReport(farmer._id, quantity);
        response = `END Thank you! Reported ${quantity}L for collection.`;
        session.step = 'complete';
      } else {
        response = `CON Invalid amount. Please enter milk in liters:`;
      }
      break;
      
    // ... other steps
  }
  
  // Save session
  USSD_SESSIONS.set(sessionId, session);
  return response;
}

// Auto-cleanup old sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of USSD_SESSIONS.entries()) {
    if (now - session.createdAt > 300000) {
      USSD_SESSIONS.delete(id);
    }
  }
}, 60000);