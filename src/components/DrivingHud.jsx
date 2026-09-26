export default function DrivingHud() {
  return (
    <>
      <section id="hud" hidden={true} aria-label="Driving controls">
        <div id="speedBox" className="glass">
          <span className="eyebrow">{"LIVE SPEED"}</span>
          <div>
            <b id="speed">{"0"}</b>
            <span className="unit">{"KM/H"}</span>
          </div>
          <small className="tripReadout">
            {"DISTANCE "}
            <b id="tripDistance">{"0 m"}</b>
          </small>
          <small id="sceneLabel">{"COUNTRYSIDE / SUNNY"}</small>
        </div>
        <div id="raceBox" className="glass">
          <span id="modeLabel" className="eyebrow">
            {"FREE RIDE"}
          </span>
          <strong id="timer">{"0.00 km"}</strong>
          <small id="position">{"ENDLESS ROAD"}</small>
        </div>
        <div id="topBar">
          <label id="liveMapControl" className="glass" hidden={true}>
            {"Map\n          "}
            <select
              id="liveMapSelect"
              aria-label="Change map during free ride"
            ></select>
          </label>
          <button id="cameraBtn" className="glass">
            {"Camera: Chase"}
          </button>
          <button id="sceneBtn" className="glass">
            {"Weather"}
          </button>
          <button
            id="resetBtn"
            className="glass"
            title="Center the vehicle (R)"
          >
            {"\n          Center"}
          </button>
          <button id="lobbyBtn" className="glass">
            {"Pause ❚❚"}
          </button>
        </div>
        <div id="status" className="glass" role="status"></div>
        <div id="ghost" hidden={true}>
          {"\n        GHOST RECOVERY "}
          <b>{"2.0s"}</b>
          <small>
            {"Keep driving - traffic collisions are temporarily disabled"}
          </small>
        </div>
        <button id="left" className="control" aria-label="Steer left">
          {"←"}
        </button>
        <button id="right" className="control" aria-label="Steer right">
          {"\n        →\n      "}
        </button>
        <button id="horn" className="control">
          {"HORN"}
        </button>
        <button id="auto" className="glass" aria-pressed="false">
          {"\n        AUTO DRIVE: OFF\n      "}
        </button>
        <button id="turbo" className="control" aria-label="Hold turbo">
          {"TURBO"}
        </button>
        <div
          id="turboMeter"
          role="progressbar"
          aria-label="Turbo charge"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="100"
        >
          <span>
            {"TURBO "}
            <b id="turboCharge">{"100%"}</b>
          </span>
          <div>
            <i id="turboFill"></i>
          </div>
        </div>
        <span id="turboStatus" hidden={true}>
          {"TURBO ACTIVE"}
        </span>
        <button id="reverse" className="control">
          {"REVERSE"}
        </button>
        <button id="brake" className="control">
          {"BRAKE"}
        </button>
        <button id="accel" className="control">
          {"HOLD"}
          <br />
          {"DRIVE"}
        </button>
      </section>
    </>
  );
}
