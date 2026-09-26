export default function GameOverlays() {
  return (
    <>
      <div id="countdown" hidden={true} aria-live="polite">
        <span>{"READY TO RACE"}</span>
        <strong id="countdownValue">{"3"}</strong>
        <small>{"Hold ↑ to launch"}</small>
      </div>
      <div id="graphicsNotice" hidden={true} role="alert">
        {"\n      Graphics paused. Waiting for the display to recover…\n    "}
      </div>
      <section
        id="results"
        className="overlay"
        hidden={true}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resultTitle"
      >
        <div className="glass resultPanel">
          <span className="eyebrow">{"30-SECOND SPRINT / COMPLETE"}</span>
          <h2 id="resultTitle">{"Race complete"}</h2>
          <p id="resultSummary"></p>
          <ol id="standings"></ol>
          <button id="againBtn" className="primary">
            {"RACE AGAIN →"}
          </button>
          <button id="resultGarageBtn" className="secondary">
            {"BACK TO HOME"}
          </button>
        </div>
      </section>
      <section
        id="pauseOverlay"
        className="overlay"
        hidden={true}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pauseTitle"
      >
        <div className="glass resultPanel">
          <span className="eyebrow">{"TAKE YOUR TIME"}</span>
          <div className="pauseGlyph" aria-hidden="true">
            {"❚❚"}
          </div>
          <h2 id="pauseTitle">{"Take a breather."}</h2>
          <p>{"Your road will be right here."}</p>
          <p id="pauseSummary" className="pauseSummary"></p>
          <button id="resumeBtn" className="primary">
            {"RESUME DRIVE"}
          </button>
          <button id="restartBtn" className="secondary">
            {"RESTART"}
          </button>
          <button id="pauseSettingsBtn" className="secondary">
            {"SETTINGS"}
          </button>
          <button id="pauseHomeBtn" className="secondary">
            {"BACK TO HOME"}
          </button>
        </div>
      </section>
      <section
        id="settingsOverlay"
        className="overlay"
        hidden={true}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
      >
        <div className="glass resultPanel">
          <span className="eyebrow">{"YOUR PREFERENCES"}</span>
          <h2 id="settingsTitle">{"Settings"}</h2>
          <p id="settingsContext"></p>
          <div className="settingsSection">{"AUDIO & DISPLAY"}</div>
          <label className="settingRow">
            {"Sound "}
            <input id="soundSetting" type="checkbox" defaultChecked={true} />
          </label>
          <label className="settingRow">
            {"Camera\n          "}
            <select id="cameraSetting" aria-label="Camera view"></select>
          </label>
          <label className="settingRow">
            {"Graphics\n          "}
            <select id="qualitySetting">
              <option value="high">{"High"}</option>
              <option value="low">{"Performance"}</option>
            </select>
          </label>
          <div className="controlsGuide">
            <span className="eyebrow">{"KEYBOARD CONTROLS"}</span>
            <p>
              <kbd>{"↑"}</kbd>
              {" Accelerate "}
              <kbd>{"↓"}</kbd>
              {" Reverse\n            "}
              <kbd>{"← →"}</kbd>
              {" Steer\n          "}
            </p>
            <p>
              <kbd>{"Space"}</kbd>
              {" Brake "}
              <kbd>{"Ctrl"}</kbd>
              {" Turbo "}
              <kbd>{"R"}</kbd>
              {" Center\n          "}
            </p>
            <p>
              <kbd>{"W"}</kbd>
              {" Weather "}
              <kbd>{"C"}</kbd>
              {" Camera "}
              <kbd>{"Esc"}</kbd>
              {" Pause"}
            </p>
          </div>
          <button id="closeSettingsBtn" className="primary">
            {"SAVE & BACK"}
          </button>
        </div>
      </section>
    </>
  );
}
