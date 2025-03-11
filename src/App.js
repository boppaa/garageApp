import React, { useState, useEffect } from "react";
import * as Tone from "tone";

const drumSounds = {
    Kick1: "/assets/sounds/drum_kits/default_kit/kick1.aif",
    Kick2: "/assets/sounds/drum_kits/default_kit/kick2.aif",
    Snare: "/assets/sounds/drum_kits/default_kit/snare.aif",
    HiHat1: "/assets/sounds/drum_kits/default_kit/hihat1.aif",
    HiHat2: "/assets/sounds/drum_kits/default_kit/hihat2.aif",
    Clap: "/assets/sounds/drum_kits/default_kit/clap.aif",
  };

const numSteps = 8; // Number of steps per sequence
  
function DrumSequencer() {
    const [players, setPlayers] = useState(null); // Stores the loaded sound players
    const [sequence, setSequence] = useState(
        Object.keys(drumSounds).reduce((seq, sound) => {
            seq[sound] = Array(numSteps).fill(false); // Initialize sequence as false
            return seq;
        }, {})
    );
    const [isPlaying, setIsPlaying] = useState(false); // Track if the sequencer is playing
    const [currentStep, setCurrentStep] = useState(0); // Track the current step in the sequence

    // Load sounds on component mount
    useEffect(() => {
        const loadedPlayers = {};
        Object.entries(drumSounds).forEach(([name, url]) => {
            loadedPlayers[name] = new Tone.Player(url).toDestination();
        });

        // Wait until Tone.js is fully loaded
        Tone.loaded().then(() => setPlayers(loadedPlayers));

        // Clean up on component unmount
        return () => {
            Tone.Transport.stop();
            Tone.Transport.cancel();
        };
    }, []);

    useEffect(() => {
        if (isPlaying) {
          if (Tone.Transport.state === "stopped") {
            Tone.Transport.start(); // Start transport when playback starts
          }
        } else {
          if (Tone.Transport.state === "started") {
            Tone.Transport.stop(); // Stop transport when playback stops
          }
        }
      }, [isPlaying]);

      // Cancel any previous scheduled events to reset timing
      Tone.Transport.cancel(); // I think this may be causing the uneven bpm
      
      useEffect(() => {
        if (!isPlaying || !players) return;
      
        Tone.Transport.scheduleRepeat((time) => {
          setCurrentStep((prevStep) => (prevStep + 1) % numSteps);
      
          Object.entries(sequence).forEach(([sound, steps]) => {
            if (steps[currentStep]) {
              players[sound].start(time);
            }
          });
        }, "16n");
      }, [isPlaying, players, sequence, currentStep]);

    // Handle play/pause toggling
    const startStopPlayback = () => {
        if (isPlaying) {
            Tone.Transport.stop(); // toggle the transport off
        } else {
            Tone.Transport.start(); // toggle the transport on
        }
        setIsPlaying((prev) => !prev); // Toggle play state
    };

    // Toggle the state of a particular step in the sequence
    const toggleStep = (sound, step) => {
        setSequence((prevSequence) => ({
            ...prevSequence,
            [sound]: prevSequence[sound].map((active, index) =>
                index === step ? !active : active
            ),
        }));
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Drum Sequencer</h1>
            <button
                onClick={startStopPlayback}
                style={{ marginBottom: "20px", padding: "10px", fontSize: "16px" }}
            >
                {isPlaying ? "Stop" : "Play"}
            </button>

            <div style={{
                display: "flex",
                flexDirection: "column", // Stack instruments vertically
                alignItems: "center", // Center the instruments
                gap: "20px", // Space out the instruments
                justifyContent: "center",
            }}>
                {Object.keys(drumSounds).map((sound) => (
                    <div key={sound} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                        <span style={{
                            marginBottom: "5px", // Space between instrument name and buttons
                            fontSize: "16px",
                            fontWeight: "bold",
                        }}>
                            {sound}
                        </span>
                        <div style={{
                            display: "flex",
                            gap: "5px",
                        }}>
                            {sequence[sound].map((isActive, step) => (
                                <button
                                    key={`${sound}-${step}`}
                                    onClick={() => toggleStep(sound, step)}
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        background: isActive ? "#0a1bd1" : "#ccc",
                                        border: "1px solid #999",
                                        cursor: "pointer",
                                        transition: "background 0.3s",
                                        opacity: currentStep === step ? 0.7 : 1,
                                    }}
                                    // disabled={!isPlaying} // Disable buttons when not playing
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DrumSequencer;

