"use client";
import React, { useState, useRef } from "react";

//Note:
//This is the heart of the app. It uses react-leaflet to display the map and make markers

    export default function MapApp() {
        // Dynamically import react-leaflet and leaflet only on client
        const [leafletLoaded, setLeafletLoaded] = useState(false);
        const [MapComponents, setMapComponents] = useState(null);
        const [L, setL] = useState(null);

        // Load Leaflet and react-leaflet on mount
        React.useEffect(() => {
    let cancelled = false;
    (async () => {
        const leaflet = await import("leaflet");
        const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = await import("react-leaflet");
        await import("leaflet/dist/leaflet.css");

        if (cancelled) return; // prevent setState after unmount

        delete leaflet.Icon.Default.prototype._getIconUrl;
        leaflet.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        setMapComponents({ MapContainer, TileLayer, Marker, Popup, useMapEvents });
        setL(leaflet);
        setLeafletLoaded(true);
    })();
    return () => { cancelled = true; };
    }, []);


    const [adding, setAdding] = useState(true);
    const [locations, setLocations] = useState([]);
    const [showPrompt, setShowPrompt] = useState(false);
    const [currentLatLng, setCurrentLatLng] = useState(null);
    const [infoInput, setInfoInput] = useState("");
    const [detailsInput, setDetailsInput] = useState("");
    const infoRef = useRef();

    const handleMapClick = (latlng) => {
        setCurrentLatLng(latlng);
        setShowPrompt(true);
        setInfoInput("");
        setDetailsInput("");
        setTimeout(() => infoRef.current && infoRef.current.focus(), 100);
    };

    const handleInfoSubmit = (e) => {
        e.preventDefault();
        if (!infoInput.trim()) return;
        setLocations([
            ...locations,
            {
                latlng: currentLatLng,
                info: infoInput,
                details: detailsInput,
            },
        ]);
        setShowPrompt(false);
        setCurrentLatLng(null);
        setInfoInput("");
        setDetailsInput("");
    };

    const handleDone = () => {
        setAdding(false);
        setShowPrompt(false);
    };

    const handleReset = () => {
        setLocations([]);
        setAdding(true);
        setShowPrompt(false);
        setCurrentLatLng(null);
        setInfoInput("");
        setDetailsInput("");
    };

    // LocationMap component for map click events
    function LocationMap({ adding, onMapClick, MapComponents }) {
        // MapComponents is provided only when leaflet/react-leaflet are loaded.
        // Call the hook unconditionally here (it will always be a function when
        // this component is rendered), and guard behavior inside the handler.
        const { useMapEvents } = MapComponents;

        useMapEvents({
            click: (e) => {
                if (adding) {
                    onMapClick(e.latlng);
                }
            },
        });

        return null;
    }


    //The actual map. Utilizes openstreetmap API
    return (
        <div style={{ fontFamily: "sans-serif", padding: 16 }}>
            <h2>Lab 2 Interactable Map</h2>
            <div style={{ height: "400px", marginBottom: 16 }}>
                {leafletLoaded && MapComponents ? (
                    <MapComponents.MapContainer
                        center={[40, -100]}
                        zoom={4}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <MapComponents.TileLayer
                            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMap adding={adding} onMapClick={handleMapClick} />
                        {locations.map((loc, idx) => (
                            <MapComponents.Marker key={idx} position={loc.latlng}>
                                <MapComponents.Popup>
                                    <div>
                                        <strong>{loc.info}</strong>
                                        {loc.details && (
                                            <div style={{ marginTop: 6, color: "#444" }}>
                                                {loc.details}
                                            </div>
                                        )}
                                    </div>
                                </MapComponents.Popup>
                            </MapComponents.Marker>
                        ))}
                    </MapComponents.MapContainer>
                ) : (
                    <div>Loading map...</div>
                )}
            </div>
            {adding && (
                <div style={{ marginBottom: 12 }}>
                    {adding && (
                        <button
                            onClick={handleDone}
                            disabled={locations.length === 0}
                            style={{
                                background: locations.length === 0 ? "#ccc" : "#1976d2",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 20px",
                                marginRight: "8px",
                                cursor: locations.length === 0 ? "not-allowed" : "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Done
                        </button>
                    )}
                    <button
                        onClick={handleReset}
                        style={{
                            background: "#e53935",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "8px 20px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Reset
                    </button>
                </div>
            )}
            {adding && locations.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <h3>Places Entered:</h3>
                    <ul>
                        {locations.map((loc, idx) => (
                            <li key={idx}>
                                <strong>
                                    [{loc.latlng.lat.toFixed(4)}, {loc.latlng.lng.toFixed(4)}]
                                </strong>
                                : {loc.info}
                                {loc.details && (
                                    <div style={{ fontSize: "0.95em", color: "#444", marginTop: 2 }}>
                                        <em>Details:</em> {loc.details}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {showPrompt && (
                <div
                    style={{
                        position: "fixed",
                        top: "30%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "#fff",
                        border: "1px solid #ccc",
                        padding: 24,
                        zIndex: 1000,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        minWidth: 320
                    }}
                >
                    <form onSubmit={handleInfoSubmit}>
                        <label style={{ color: "black", display: "block" }}>
                            Enter info for location [{currentLatLng?.lat?.toFixed(4)}, {currentLatLng?.lng?.toFixed(4)}]:
                            <br />
                            <input
                                ref={infoRef}
                                type="text"
                                value={infoInput}
                                onChange={(e) => setInfoInput(e.target.value)}
                                style={{ width: "100%", marginTop: 8, color: "#222", background: "#fff", border: "1px solid #bbb", padding: "8px", display: "block", borderRadius: "4px", fontSize: "1.05em" }}
                                required
                            />
                        </label>
                        <label style={{ color: "black", display: "block", marginTop: 12 }}>
                            Details:
                            <br />
                            <textarea
                                value={detailsInput}
                                onChange={e => setDetailsInput(e.target.value)}
                                style={{ width: "100%", minHeight: 60, marginTop: 4, color: "#222", background: "#fff", border: "1px solid #bbb", padding: "8px", borderRadius: "4px", display: "block", fontSize: "1.05em" }}
                            />
                        </label>
                        <div style={{ color: "black", marginTop: 12 }}>
                            <button type="submit">Save</button>
                            <button
                                type="button"
                                style={{ marginLeft: 8 }}
                                onClick={() => setShowPrompt(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
