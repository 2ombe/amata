import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import io from 'socket.io-client';

const CollectionTrackingScreen = ({ route }) => {
  const { collectionId } = route.params;
  const [collection, setCollection] = useState(null);
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Fetch collection data
    const fetchCollection = async () => {
      const response = await fetch(`/api/collections/${collectionId}`);
      const data = await response.json();
      setCollection(data);
    };

    fetchCollection();

    // Setup WebSocket connection
    const ws = io(API_URL, {
      query: { collectionId },
      transports: ['websocket']
    });

    ws.on('collection_update', (data) => {
      setCollection(prev => ({ ...prev, ...data }));
    });

    ws.on('vehicle_location', (location) => {
      setVehicleLocation(location);
    });

    setSocket(ws);

    return () => ws.disconnect();
  }, [collectionId]);

  if (!collection) return <LoadingIndicator />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={calculateInitialRegion(collection)}
      >
        {/* Collection center marker */}
        <Marker coordinate={collection.center.location.coordinates}>
          <View style={styles.centerMarker}>
            <Text>Collection Center</Text>
          </View>
        </Marker>

        {/* Farmer locations */}
        {collection.batches.map((batch, index) => (
          <Marker
            key={index}
            coordinate={batch.farmer.location.coordinates}
          >
            <View style={styles.farmerMarker}>
              <Text>{batch.quantity}L</Text>
            </View>
          </Marker>
        ))}

        {/* Planned route */}
        <Polyline
          coordinates={decodePolyline(collection.route.polyline)}
          strokeColor="#3498db"
          strokeWidth={4}
        />

        {/* Real-time vehicle position */}
        {vehicleLocation && (
          <Marker coordinate={vehicleLocation}>
            <View style={styles.vehicleMarker}>
              <Text>🚚</Text>
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.infoPanel}>
        <Text>Vehicle: {collection.vehicle.plateNumber}</Text>
        <Text>Next Stop: {getNextStop(collection)}</Text>
        <Text>Estimated Arrival: {formatTime(getETA(collection))}</Text>
        <Text>Total Milk: {calculateTotalMilk(collection)}L</Text>
      </View>
    </View>
  );
};

const styles = {
  centerMarker: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: '#3498db',
    borderWidth: 1
  },
  farmerMarker: {
    padding: 6,
    backgroundColor: '#2ecc71',
    borderRadius: 3
  },
  vehicleMarker: {
    padding: 8
  },
  infoPanel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    elevation: 4
  }
};