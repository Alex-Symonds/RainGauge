'use client';

import Leaflet from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

Leaflet.Icon.Default.imagePath = '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/';

export default function MyMap(props: any) {
  const { position, zoom } = props;

  return (
    <div className="mb-3">
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} style={ {height: "25vh", width: "100%"} }>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    Rain gauge (RG_A)
                </Popup>
            </Marker>
        </MapContainer>
    </div>
  )
}