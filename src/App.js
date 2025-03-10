import React from "react";
import * as Tone from "tone";

function App() {
  const playKick = () => {
    const player = new Tone.Player("https://freesound.org/data/previews/261/261573_4486188-lq.mp3").toDestination();
    player.autostart = true;
  };

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Drum Machine</h1>
      <button onClick={playKick}>Play Kick</button>
    </div>
  );
}

export default App;
