import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import socket from '../../socket';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const LiveLocationMap = ({ userId, initialLat, initialLng }) => {
    const [position, setPosition] = useState([initialLat || 0, initialLng || 0]);

    useEffect(() => {
        // Initial set if available
        if(initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }

        const handleLocationUpdate = (data) => {
             // data: { userId, lat, long }
            if (String(data.userId) === String(userId)) {
                console.log('Updating map position:', data.lat, data.long);
                setPosition([data.lat, data.long]);
            }
        };

        socket.on('user-location-update', handleLocationUpdate);

        return () => {
            socket.off('user-location-update', handleLocationUpdate);
        };
    }, [userId, initialLat, initialLng]);

    if (!position[0] && !position[1]) return <div className="p-3 text-center">Waiting for location signal...</div>;

    return (
        <MapContainer center={position} zoom={15} scrollWheelZoom={true} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    User is here
                </Popup>
            </Marker>
            <RecenterMap lat={position[0]} lng={position[1]} />
        </MapContainer>
    );
};

export default LiveLocationMap;
