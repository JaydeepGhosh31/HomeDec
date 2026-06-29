import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import DeviceCard from "./components/DeviceCard";
import ImageSlider from "./components/ImageSlider";
import { Lightbulb, Fan, Thermometer, AirVent, Sun } from "lucide-react";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { app, auth } from "./firebase";

const db = getDatabase(app);

const userName = "Jaydeep Ghosh";

const iconMap = {
  "Living Room Light": Lightbulb,
  "Bedroom Fan": Fan,
  "AC Unit": AirVent,
};

const App = () => {
  const [devices, setDevices] = useState([]);
  const [lightIntensity, setLightIntensity] = useState(0);
  const [temperature, setTemperature] = useState(0);

  // Realtime listener, waiting for auth to complete
  useEffect(() => {
    let unsubscribeDB;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated anonymously, safe to fetch data
        const homeRef = ref(db, "homeData");

        unsubscribeDB = onValue(homeRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setDevices(
              (data.devices || []).map((d) => ({
                ...d,
                icon: iconMap[d.name] || Lightbulb,
              }))
            );
            setLightIntensity(data.lightIntensity);
            setTemperature(data.temperature);
          }
        }, (error) => {
          console.error("Firebase Read Error:", error);
        });
      }
    });

    return () => {
      if (unsubscribeDB) unsubscribeDB();
      unsubscribeAuth();
    };
  }, []);

  const putData = () => {
    const data = {
      userName: userName,
      lightIntensity: lightIntensity,
      temperature: temperature,
      devices: devices.map((device) => ({
        name: device.name,
        isOn: device.isOn,
      })),
    };

    set(ref(db, "homeData"), data)
      .then(() => {
        console.log("Data written successfully.");
      })
      .catch((error) => {
        console.error("Error writing data:", error);
      });
  };

  const details = [
    { name: "Light Intensity", icon: Sun, value: `${lightIntensity}%` },
    { name: "Temperature (°C)", icon: Thermometer, value: `${temperature}°C` },
  ];

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white min-h-screen relative font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <Sidebar
        onScrollToSection={(sectionId) => {
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* Logo at Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl shadow-lg border border-white/30 hover:bg-white/30 hover:scale-105 transition-all duration-300">
          <img src="/logo.webp" alt="App Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow-sm" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center min-h-screen mt-16 p-6 animate-fade-in-up">
        <h1 className="text-5xl font-extrabold tracking-tight ml-2 w-full text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-sm">HomeDec</h1>
        <p className="text-gray-300 text-lg mb-6 mt-2 ml-2 w-full font-medium">
          Welcome, {userName}!
        </p>

        {/* Image Slider */}
        <ImageSlider />
        <br id="control-devices" />

        {/* Device Control Section */}
        <p className="text-white font-semibold text-3xl mb-6 mt-10 ml-2 w-full tracking-wide">
          Control Devices
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center justify-center gap-4 w-full max-w-4xl">
          {devices.map((device, index) => (
            <DeviceCard key={index} device={device} db={db} />
          ))}
        </div>

        {/* Environment Details Section */}
        <br id="see-details" />
        <p className="text-white font-semibold text-3xl mb-6 mt-12 ml-2 w-full tracking-wide">
          Environment Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center justify-center gap-4 w-full max-w-4xl">
          {details.map((device, index) => (
            <DeviceCard key={index} device={device} mode="detail" />
          ))}
        </div>

        {/* About Section */}
        <br id="about" />
        <p className="text-white font-semibold text-3xl mb-6 mt-12 ml-2 w-full tracking-wide">
          About HomeDec
        </p>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-4xl transition-all duration-300 hover:shadow-indigo-500/10">
          <div className="text-gray-200 text-lg leading-relaxed font-light">
            <strong className="text-white font-semibold">HomeDec</strong> is a smart home automation project that
            empowers users to control and monitor devices like lights, fans, and
            ACs remotely. Built using <strong className="text-indigo-300">IoT technology</strong> and a{" "}
            <strong className="text-indigo-300">Raspberry Pi</strong>, it offers real-time interaction with
            connected smart devices in your home.
            <br />
            <strong className="text-white font-semibold text-xl block mt-4 mb-2">Key Features:</strong>
            <ul className="list-disc list-inside space-y-2 text-gray-300 bg-white/5 p-4 rounded-xl border border-white/10">
              <li>Remote device control with live status updates</li>
              <li>Environmental monitoring via sensors</li>
              <li>Responsive dashboard with interactive UI and image slider</li>
            </ul>
            <br />
            <div className="mt-4 p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-center">
              <span className="text-indigo-200 font-medium tracking-wider uppercase text-sm">Developed by</span>
              <p className="text-2xl font-bold text-white mt-1">Jaydeep Ghosh</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
