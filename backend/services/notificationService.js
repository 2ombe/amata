// notificationService.js

const ussdResponses = {
  farmer_menu: `CON Select option:
1. Report milk ready
2. Check collection time
3. View latest prices
4. Payment history`,

  report_milk: `CON Enter milk amount in liters:`,
  
  collection_time: (time) => `END Your milk will be collected at ${time}`,
  
  invalid_option: `END Invalid option selected`
};

async function handleUSSDRequest(phoneNumber, text) {
  const input = text.split('*');
  const sessionId = input[0];
  const userInput = input.slice(1);
  
  // Get or create user session
  let session = await USSDSession.findOne({ sessionId }) || 
    new USSDSession({ sessionId, phoneNumber });
  
  // Determine current menu level
  let response;
  if (userInput.length === 0) {
    response = ussdResponses.farmer_menu;
    session.menuLevel = 'main';
  } 
  else if (session.menuLevel === 'main') {
    switch (userInput[0]) {
      case '1':
        response = ussdResponses.report_milk;
        session.menuLevel = 'report_milk';
        break;
      case '2':
        const farmer = await Farmer.findOne({ contact: { phone: phoneNumber } });
        const nextCollection = await getNextCollectionTime(farmer._id);
        response = ussdResponses.collection_time(nextCollection);
        session.menuLevel = null; // End session
        break;
      // ... other cases
      default:
        response = ussdResponses.invalid_option;
        session.menuLevel = null;
    }
  }
  else if (session.menuLevel === 'report_milk') {
    const quantity = parseFloat(userInput[0]);
    if (!isNaN(quantity)) {
      const farmer = await Farmer.findOne({ contact: { phone: phoneNumber } });
      await recordMilkReport(farmer._id, quantity);
      response = `END Thank you! Reported ${quantity}L ready for collection.`;
    } else {
      response = `END Invalid amount. Please try again.`;
    }
    session.menuLevel = null;
  }
  
  await session.save();
  return response;
}

// Helper to get next collection time
async function getNextCollectionTime(farmerId) {
  const farmer = await Farmer.findById(farmerId).populate('collectionCenter');
  const center = farmer.collectionCenter;
  
  // Get scheduled collections for this center
  const nextCollection = await CollectionSchedule.findOne({
    center: center._id,
    date: { $gte: new Date() }
  }).sort({ date: 1 });
  
  return nextCollection 
    ? nextCollection.date.toLocaleTimeString() 
    : 'not scheduled yet';
}