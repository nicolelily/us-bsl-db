import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BreedLegislation } from '@/types';
import { Gavel, ExternalLink } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icon issues in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
    data: BreedLegislation[];
    selectedState?: string | null;
}

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

// Zooms the map to fit the selected state's markers, and back out when the filter clears
const StateZoom: React.FC<{ selectedState?: string | null; positions: [number, number][] }> = ({ selectedState, positions }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedState && positions.length > 0) {
            map.flyToBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 8 });
        } else {
            // No filter, or the selected state has no markers: return to the full US view
            map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedState, map]);

    return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ data, selectedState }) => {
    // Filter data to only include items with valid lat/lng
    const mapData = data.filter(item => item.lat !== undefined && item.lng !== undefined);

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'ban':
                return '#ef4444'; // destructive/red
            case 'restriction':
                return '#C5763D'; // orange-ish
            case 'repealed':
                return '#74CFC5'; // teal
            case 'unverified':
                return '#6b7280'; // gray
            default:
                return '#3b82f6'; // blue
        }
    };

    const createCustomIcon = (type: string) => {
        const color = getMarkerColor(type);
        const iconHtml = renderToString(
            <div style={{
                backgroundColor: color,
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                border: '2px solid white'
            }}>
                <Gavel size={12} color="white" />
            </div>
        );

        return L.divIcon({
            html: iconHtml,
            className: 'custom-marker-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24],
        });
    };

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-md border border-gray-200 z-0 relative">
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <StateZoom
                    selectedState={selectedState}
                    positions={mapData.map(item => [item.lat!, item.lng!] as [number, number])}
                />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapData.map((item) => (
                    <Marker
                        key={item.id}
                        position={[item.lat!, item.lng!]}
                        icon={createCustomIcon(item.legislationType)}
                    >
                        <Tooltip direction="top" offset={[0, -24]} opacity={1}>
                            <div className="text-sm font-medium">
                                <div className="font-bold">{item.municipality}, {item.state}</div>
                                <div>Type: {item.municipalityType}</div>
                                {item.bannedBreeds.length > 0 && (
                                    <div className="mt-1">
                                        <span className="text-xs text-gray-500">Breeds:</span>
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                            {item.bannedBreeds.slice(0, 3).map((breed, idx) => (
                                                <span key={idx} className="text-xs bg-gray-100 px-1 rounded">{breed}</span>
                                            ))}
                                            {item.bannedBreeds.length > 3 && (
                                                <span className="text-xs text-gray-500">+{item.bannedBreeds.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Tooltip>
                        <Popup>
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-lg mb-1">{item.municipality}, {item.state}</h3>
                                <div className="mb-2">
                                    <span className={`inline-block px-2 py-0.5 rounded text-xs text-white capitalize`} style={{ backgroundColor: getMarkerColor(item.legislationType) }}>
                                        {item.legislationType}
                                    </span>
                                    <span className="ml-2 text-xs text-gray-500">{item.municipalityType}</span>
                                </div>

                                {item.bannedBreeds.length > 0 && (
                                    <div className="mb-3">
                                        <h4 className="font-semibold text-sm mb-1">Banned/Restricted Breeds:</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {item.bannedBreeds.map((breed, idx) => (
                                                <span key={idx} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                    {breed}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {item.ordinanceUrl && (
                                    <a
                                        href={item.ordinanceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                                    >
                                        View Ordinance <ExternalLink size={14} className="ml-1" />
                                    </a>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
