// Mobile app component
async function reportMilk(quantity, qualityMetrics) {
  const response = await fetch(`${API_URL}/milk/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      farmerId: user.farmerId,
      quantity,
      qualityMetrics
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Update local state
    setBatches(prev => [data.batch, ...prev]);
    return { success: true };
  } else {
    throw new Error(data.error || 'Failed to report milk');
  }
}