import React, { useState, useEffect } from "react";
import * as Tone from "tone";

function App() {
    // State variables
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [bpm, setBpm] = useState(120); // Default BPM
    const [players, setPlayers] = useState({});
    const [sequence, setSequence] = useState({
        kick: [1, 0, 0, 0, 1, 0, 0, 0], // Example sequence for kick
        snare: [0, 0, 1, 0, 0, 0, 1, 0], // Example sequence for snare
        hiHat: [1, 0, 1, 0, 1, 0, 1, 0], // Example sequence for hi-hat
    });
    const numSteps = 8; // Number of steps in the sequence

    // Create players for each instrument sound
    useEffect(() => {
        const kickPlayer = new Tone.Player("/assets/sounds/drum_kits/default_kit/kick1.aif").toDestination();
        const snarePlayer = new Tone.Player("/assets/sounds/drum_kits/default_kit/snare.aif").toDestination();
        const hiHatPlayer = new Tone.Player("/assets/sounds/drum_kits/default_kit/hihat1.aif").toDestination();

        setPlayers({
            kick: kickPlayer,
            snare: snarePlayer,
            hiHat: hiHatPlayer,
        });
    }, []);

    // Effect for handling playback start/stop based on isPlaying
    useEffect(() => {
        if (isPlaying) {
            // Start transport only if it's stopped
            if (Tone.Transport.state === "stopped") {
                Tone.Transport.start();
            }
        } else {
            // Stop transport only if it's started
            if (Tone.Transport.state === "started") {
                Tone.Transport.stop();
            }
        }
    }, [isPlaying]); // Trigger this effect whenever `isPlaying` changes

    // Effect for scheduling sound repeats based on currentStep and transport
    useEffect(() => {
        if (!isPlaying || !players) return;

        Tone.Transport.scheduleRepeat((time) => {
            // Update the current step
            setCurrentStep((prevStep) => (prevStep + 1) % numSteps);

            // Loop through each sound in the sequence and play it if needed
            Object.entries(sequence).forEach(([sound, steps]) => {
                if (steps[Tone.Transport.position % numSteps]) {
                    players[sound].start(time);
                }
            });
        }, "16n"); // Set the repeat to trigger every 16th note (or adjust as needed)
    }, [isPlaying, players, sequence, currentStep]); // Trigger when any of these values change

    // Effect to adjust BPM if needed
    useEffect(() => {
        if (bpm !== Tone.Transport.bpm.value) {
            Tone.Transport.bpm.value = bpm;
        }
    }, [bpm]); // Trigger when BPM changes

    // Toggle play/pause
    const togglePlay = () => {
        setIsPlaying((prev) => !prev);
    };

    // Update the BPM (you can replace this with a BPM input slider or control)
    const handleBpmChange = (event) => {
        setBpm(event.target.value);
    };

    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <h1>Drum Machine</h1>

            {/* Controls */}
            <button onClick={togglePlay}>
                {isPlaying ? "Stop" : "Start"}
            </button>

            <div>
                <label>
                    BPM:
                    <input
                        type="number"
                        value={bpm}
                        onChange={handleBpmChange}
                        min="60"
                        max="200"
                    />
                </label>
            </div>

            {/* Grid of buttons for each step of the sequence */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "10px" }}>
                {Object.keys(sequence).map((instrument) => (
                    <div key={instrument}>
                        <h3>{instrument}</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
                            {sequence[instrument].map((isActive, idx) => (
                                <button
                                    key={idx}
                                    style={{
                                        backgroundColor: isActive ? "green" : "gray",
                                        padding: "10px",
                                        border: "1px solid black",
                                    }}
                                    onClick={() => {
                                        setSequence((prevSequence) => {
                                            const newSequence = { ...prevSequence };
                                            newSequence[instrument][idx] = !newSequence[instrument][idx];
                                            return newSequence;
                                        });
                                    }}
                                >
                                    {isActive ? "X" : "O"}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
