import { useEffect, useState } from "react";
import GameStage from "./components/GameStage.jsx";
import Lobby from "./components/Lobby.jsx";
import DrivingHud from "./components/DrivingHud.jsx";
import GameOverlays from "./components/GameOverlays.jsx";
import { startGame } from "./game/startGame.js";

export default function App() {
  const [error, setError] = useState(null);
  useEffect(() => {
    try {
      return startGame();
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  }, []);
  if (error)
    return (
      <main className="startupError" role="alert">
        <h1>Unable to start Road Club</h1>
        <p>{error}</p>
        <button onClick={() => location.reload()}>Try again</button>
      </main>
    );
  return (
    <>
      <GameStage />
      <Lobby />
      <DrivingHud />
      <GameOverlays />
    </>
  );
}
