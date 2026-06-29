import React, { useState, useEffect } from "react";
import { ref, get, set } from "firebase/database";

const DeviceCard = ({ device, mode = "control", db }) => {
  const [isOn, setIsOn] = useState(device.isOn || false);
  const [brightness, setBrightness] = useState(device.brightness || 100); // Default to 100%
  const IconComponent = device.icon;

  // Sync with Firebase if data changes
  useEffect(() => {
    setIsOn(device.isOn || false);
    setBrightness(device.brightness ?? 100);
  }, [device.isOn, device.brightness]);

  const handleToggle = async () => {
    const newState = !isOn;
    setIsOn(newState);

    try {
      const homeRef = ref(db, "homeData");
      const snapshot = await get(homeRef);
      const data = snapshot.val();

      if (data && Array.isArray(data.devices)) {
        const updatedDevices = data.devices.map((d) =>
          d.name === device.name ? { ...d, isOn: newState } : d
        );

        await set(homeRef, {
          ...data,
          devices: updatedDevices,
        });

        console.log(`Toggled ${device.name} to ${newState ? "ON" : "OFF"}`);
      }
    } catch (err) {
      console.error("Error toggling device:", err);
    }
  };

  const handleBrightnessChange = async (e) => {
    const newBrightness = parseInt(e.target.value, 10);
    setBrightness(newBrightness);

    try {
      const homeRef = ref(db, "homeData");
      const snapshot = await get(homeRef);
      const data = snapshot.val();

      if (data && Array.isArray(data.devices)) {
        const updatedDevices = data.devices.map((d) =>
          d.name === device.name ? { ...d, brightness: newBrightness } : d
        );

        await set(homeRef, {
          ...data,
          devices: updatedDevices,
        });

        console.log(`Changed ${device.name} brightness to ${newBrightness}%`);
      }
    } catch (err) {
      console.error("Error updating brightness:", err);
    }
  };

  if (mode === "detail") {
    return (
      <div className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex justify-between items-center w-full transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-indigo-500/20">
        <div className="text-left">
          <p className="text-3xl font-bold text-white tracking-tight">
            {device.value !== null ? device.value : "--"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {IconComponent && (
            <IconComponent className="w-7 h-7 text-cyan-400" />
          )}
          <h3 className="font-semibold text-gray-300 tracking-wide">{device.name}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex flex-col items-center w-full transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 hover:shadow-2xl hover:shadow-indigo-500/20 group">
      {IconComponent && (
        <IconComponent
          className={`w-14 h-14 transition-colors duration-300 ${isOn ? "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "text-gray-400"}`}
        />
      )}
      <h3 className="mt-4 font-semibold text-white tracking-wide text-lg">{device.name}</h3>

      {/* ON/OFF TOGGLE */}
      <div className="mt-4 flex items-center bg-white/5 px-4 py-2 rounded-full border border-white/10">
        <span className="mr-3 text-sm font-medium text-gray-300 uppercase tracking-wider">
          {isOn ? "On" : "Off"}
        </span>
        <label className="inline-flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={isOn}
              onChange={handleToggle}
              className="sr-only"
            />
            <div
              className={`w-12 h-6 rounded-full shadow-inner transition-colors duration-300 ${
                isOn
                  ? "bg-cyan-500"
                  : "bg-white/20"
              }`}
            ></div>
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
                isOn
                  ? "translate-x-6"
                  : "translate-x-0"
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* BRIGHTNESS SLIDER */}
      {device.name.toLowerCase().includes("light") && (
        <div className="mt-5 w-full px-4">
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest text-center">
            Brightness: <span className="text-white">{brightness}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={brightness}
            onChange={isOn ? handleBrightnessChange : undefined} // Only allow changing when ON
            disabled={!isOn} // Disable slider when light is OFF
            className={`w-full h-2 rounded-lg appearance-none relative
              ${isOn ? "bg-white/20 accent-cyan-400 cursor-pointer" : "bg-white/10 cursor-not-allowed opacity-50"}
            `}
            style={{
              background: isOn
                ? `linear-gradient(to right, #22d3ee 0%, #22d3ee ${brightness}%, rgba(255,255,255,0.2) ${brightness}%, rgba(255,255,255,0.2) 100%)`
                : undefined,
            }}
          />
          {/* Custom styles for thumb */}
          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: white;
              border: 2px solid ${isOn ? "#22d3ee" : "#71717a"};
              cursor: pointer;
              margin-top: -1px;
              box-shadow: 0 0 10px rgba(0,0,0,0.2);
            }
            input[type="range"]::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: white;
              border: 2px solid ${isOn ? "#22d3ee" : "#71717a"};
              cursor: pointer;
              box-shadow: 0 0 10px rgba(0,0,0,0.2);
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
