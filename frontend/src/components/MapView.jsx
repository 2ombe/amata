// import React from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import './charts/MapView.css';

// // Fix for default marker icons in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

// const MapView = ({ markers = [], center = [-1.9403, 29.8739], zoom = 10 }) => {
//   return (
//     <MapContainer 
//       center={center} 
//       zoom={zoom} 
//       style={{ height: '100%', width: '100%' }}
//     >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//       />
//       {markers.map((marker, index) => (
//         <Marker key={index} position={marker.position}>
//           <Popup>
//             <div>
//               <h6>{marker.title}</h6>
//               <p>Coordinates: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}</p>
//             </div>
//           </Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   );
// };

// export default MapView;