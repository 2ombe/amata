// Map component for tracking
function BatchMapView({ batchId }) {
  const [journey, setJourney] = useState(null);
  const [realTimeLocation, setRealTimeLocation] = useState(null);
  
  useEffect(() => {
    // Load initial journey
    fetchBatchJourney();
    
    // Setup WebSocket for realtime updates
    const ws = new WebSocket(`${WS_URL}?batchId=${batchId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'location_update') {
        setRealTimeLocation(data.coordinates);
      }
    };
    
    return () => ws.close();
  }, [batchId]);
  
  async function fetchBatchJourney() {
    const res = await fetch(`${API_URL}/batches/${batchId}/journey`);
    const data = await res.json();
    setJourney(data.journey);
  }
  
  return (
    <MapView>
      {journey?.map((stop, i) => (
        <Marker key={i} coordinate={stop.location}>
          <Callout>
            <Text>{stop.type}</Text>
            <Text>{new Date(stop.timestamp).toLocaleString()}</Text>
          </Callout>
        </Marker>
      ))}
      
      {realTimeLocation && (
        <Marker coordinate={realTimeLocation} pinColor="blue">
          <Callout>
            <Text>Current Location</Text>
          </Callout>
        </Marker>
      )}
    </MapView>
  );
}