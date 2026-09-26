export default function Lobby() {
  return (
    <>
      <section id="lobby" aria-label="Road Club lobby">
        <button
          id="homeSettingsBtn"
          className="settingsCorner"
          aria-label="Settings"
          title="Settings"
        >
          {"\n        ⚙\n      "}
        </button>
        <div id="vehicleArrows" aria-label="Select your vehicle">
          <button id="prevVehicle" aria-label="Previous vehicle">
            {"❮"}
          </button>
          <button id="nextVehicle" aria-label="Next vehicle">
            {"❯"}
          </button>
        </div>
        <header className="brand">
          <span className="eyebrow">{"TWELVE RIDES. ONE OPEN ROAD."}</span>
          <h1>
            {"ROAD"}
            <span>{"CLUB"}</span>
          </h1>
          <p>{"Big skies. Bright roads. Your next ride."}</p>
          <span className="clubStatus">
            <i></i>
            {" WELCOME TO THE MOTOR FESTIVAL"}
          </span>
        </header>
        <div id="vehicleCaption">
          <span className="eyebrow">{"YOUR SELECTED VEHICLE / LIVE 3D"}</span>
          <div className="previewHeading">
            <h2 id="carName">{"Sport Coupe"}</h2>
            <button id="garageReset" title="Reset rotation and zoom">
              {"\n            Reset view\n          "}
            </button>
          </div>
          <p id="vehicleCount" className="intro" aria-live="polite"></p>
          <div
            id="vehicleStats"
            className="vehicleStats"
            aria-label="Selected vehicle details"
          ></div>
          <p className="orbitHelp">
            {"Drag to rotate · scroll or pinch to zoom"}
          </p>
          <p id="carSpec" className="modelDescription">
            {
              "\n          Rear spoiler / performance wheels / metallic finish\n        "
            }
          </p>
          <div className="previewTools">
            <button
              id="riderPreview"
              hidden={true}
              aria-label="Show rider in garage"
              aria-pressed="false"
            >
              {"\n            RIDER"}
            </button>
            <button
              id="autoRotate"
              aria-label="Toggle automatic vehicle rotation"
              aria-pressed="true"
              title="Auto rotation"
            >
              {"\n            AUTO"}
            </button>
            <button id="rotateLeft" aria-label="Rotate vehicle left">
              {"\n            ↶"}
            </button>
            <button id="rotateRight" aria-label="Rotate vehicle right">
              {"\n            ↷"}
            </button>
            <button id="zoomIn" aria-label="Zoom in">
              {"+"}
            </button>
            <button id="zoomOut" aria-label="Zoom out">
              {"−"}
            </button>
            <button
              id="expandPreview"
              aria-label="Expand vehicle preview"
              aria-pressed="false"
            >
              {"\n            ⛶ Full screen\n          "}
            </button>
          </div>
        </div>
        <main id="lobbyPanel" className="glass">
          <div className="panelTop">
            <span className="eyebrow" id="stepLabel">
              {"ROAD CLUB / LOBBY"}
            </span>
            <span className="sessionBadge">{"LOCAL PLAY"}</span>
          </div>
          <nav id="steps" aria-label="Journey setup">
            <button data-page="home">
              <span className="stepNumber">{"⌂"}</span>
              <span>{"Lobby"}</span>
            </button>
            <button data-page="vehicle">
              <span className="stepNumber">{"01"}</span>
              <span>{"Vehicle"}</span>
            </button>
            <button data-page="maps">
              <span className="stepNumber">{"02"}</span>
              <span>{"Maps"}</span>
            </button>
            <button data-page="weather">
              <span className="stepNumber">{"03"}</span>
              <span>{"Weather"}</span>
            </button>
            <button data-page="mode">
              <span className="stepNumber">{"04"}</span>
              <span>{"Mode"}</span>
            </button>
            <button data-page="ready">
              <span className="stepNumber">{"05"}</span>
              <span>{"Review"}</span>
            </button>
          </nav>
          <div className="formOptions">
            <section data-screen="home">
              <span className="eyebrow">{"WELCOME TO YOUR LOBBY"}</span>
              <h2>
                {"GOOD ROADS."}
                <br />
                <em>{"GREAT RIDES."}</em>
              </h2>
              <p className="intro">
                {"\n              Pick your machine. Set the scene."}
                <br />
                {
                  "There is a whole road\n              waiting for you.\n            "
                }
              </p>
              <div className="selectionCard">
                <span className="eyebrow">{"READY IN YOUR GARAGE"}</span>
                <h3 id="homeVehicle">{"Sport Coupe"}</h3>
                <p id="homeSummary"></p>
                <button id="quickDriveBtn" className="textButton">
                  {"\n                Review this journey →\n              "}
                </button>
              </div>
              <div className="stageActions">
                <button id="selectVehicleBtn" className="menuAction">
                  <span>
                    {"01 "}
                    <strong>{"Select vehicle"}</strong>
                  </span>
                  <span>{"→"}</span>
                </button>
                <button
                  id="mapsBtn"
                  className="menuAction liveChoice"
                  title="Next map"
                >
                  <span>
                    <small>{"MAP"}</small>
                    <strong id="lobbyMapValue"></strong>
                  </span>
                  <span aria-hidden="true">{"↻"}</span>
                </button>
                <button
                  id="lobbyWeatherBtn"
                  className="menuAction liveChoice"
                  title="Next weather"
                >
                  <span>
                    <small>{"WEATHER"}</small>
                    <strong id="lobbyWeatherValue"></strong>
                  </span>
                  <span aria-hidden="true">{"↻"}</span>
                </button>
                <button
                  id="lobbyModeBtn"
                  className="menuAction liveChoice"
                  title="Next game mode"
                >
                  <span>
                    <small>{"MODE"}</small>
                    <strong id="lobbyModeValue"></strong>
                  </span>
                  <span aria-hidden="true">{"↻"}</span>
                </button>
              </div>
              <div className="clubNumbers">
                <span>
                  <b>{"12"}</b>
                  {"VEHICLES"}
                </span>
                <span>
                  <b>{"07"}</b>
                  {"ROADS"}
                </span>
                <span>
                  <b>{"04"}</b>
                  {"WEATHERS"}
                </span>
                <span>
                  <b>{"03"}</b>
                  {"MODES"}
                </span>
              </div>
            </section>
            <section data-screen="vehicle" hidden={true}>
              <span className="eyebrow">{"01 / FIND YOUR RIDE"}</span>
              <div className="carouselHeading">
                <h2>{"Select vehicle"}</h2>
              </div>
              <div className="paintHeading">
                <h3>{"Paint finish"}</h3>
                <span id="paintName">{"Racing red"}</span>
              </div>
              <div id="colorChoices" className="colors">
                <button
                  className="swatch active"
                  style={{ "--paint": "#c92936" }}
                  data-color="#c92936"
                  data-name="Racing red"
                  aria-label="Racing red"
                ></button>
                <button
                  className="swatch"
                  style={{ "--paint": "#2373d7" }}
                  data-color="#2373d7"
                  data-name="Atlantic blue"
                  aria-label="Atlantic blue"
                ></button>
                <button
                  className="swatch"
                  style={{ "--paint": "#e9e6de" }}
                  data-color="#e9e6de"
                  data-name="Pearl white"
                  aria-label="Pearl white"
                ></button>
                <button
                  className="swatch"
                  style={{ "--paint": "#242930" }}
                  data-color="#242930"
                  data-name="Carbon black"
                  aria-label="Carbon black"
                ></button>
                <button
                  className="swatch"
                  style={{ "--paint": "#cc9424" }}
                  data-color="#cc9424"
                  data-name="Saffron gold"
                  aria-label="Saffron gold"
                ></button>
                <button
                  className="swatch"
                  style={{ "--paint": "#326650" }}
                  data-color="#326650"
                  data-name="Forest green"
                  aria-label="Forest green"
                ></button>
                <label className="customPaint" title="Choose any paint color">
                  {"Custom"}
                  <input
                    id="customColor"
                    type="color"
                    defaultValue="#c92936"
                    aria-label="Custom car color"
                  />
                </label>
              </div>
              <div id="riderOptions" hidden={true}>
                <h3>{"Riding gear"}</h3>
                <div className="optionRow three">
                  <button className="pick active" data-rider="0">
                    {"Racing red"}
                  </button>
                  <button className="pick" data-rider="1">
                    {"Blue & gold"}
                  </button>
                  <button className="pick" data-rider="2">
                    {"Carbon"}
                  </button>
                </div>
              </div>
              <p className="intro compactHelp">
                {
                  "\n              Drag the vehicle to rotate. Use + / − to zoom, or expand for\n              a closer look.\n            "
                }
              </p>
            </section>
            <section data-screen="maps" hidden={true}>
              <span className="eyebrow">{"02 / SET THE SCENE"}</span>
              <h2>{"Choose a road"}</h2>
              <div
                id="mapPreview"
                className="mapPreview"
                role="img"
                aria-label="Countryside road preview"
              >
                <svg viewBox="0 0 480 230" aria-hidden="true">
                  <circle className="mapSun" cx="385" cy="42" r="23"></circle>
                  <path
                    className="mapHills"
                    d="M0 110L75 35L157 106L270 18L365 112L450 45L480 90V230H0Z"
                  ></path>
                  <path
                    className="mapGround"
                    d="M0 130Q150 85 480 123V230H0Z"
                  ></path>
                  <path
                    d="M105 240C90 175 360 160 252 104L238 84"
                    fill="none"
                    stroke="#c5cebf"
                    strokeWidth="61"
                  ></path>
                  <path
                    d="M105 240C90 175 360 160 252 104L238 84"
                    fill="none"
                    stroke="#34444a"
                    strokeWidth="52"
                  ></path>
                  <path
                    d="M105 240C90 175 360 160 252 104L238 84"
                    fill="none"
                    stroke="#f3dc8a"
                    strokeWidth="3"
                    strokeDasharray="12 10"
                  ></path>
                  <g className="mapCity" fill="#314654">
                    <path d="M10 132V53H53V130M62 119V22H99V117M366 120V35H405V123M420 130V63H469V136"></path>
                  </g>
                  <g className="mapTrees" fill="#233f38">
                    <path d="M18 148L42 75L67 148ZM83 134L102 65L125 134ZM352 157L380 79L407 157ZM419 176L449 83L479 176Z"></path>
                  </g>
                  <g className="mapRain" stroke="#afdef2" strokeWidth="2">
                    <path d="M40 10L25 40M110 50L95 80M180 10L165 40M270 30L255 60M350 10L335 40M440 70L425 100M120 130L105 160M310 150L295 180"></path>
                  </g>
                  <g className="mapSnow" fill="white">
                    <circle cx="40" cy="35" r="4"></circle>
                    <circle cx="150" cy="75" r="4"></circle>
                    <circle cx="250" cy="35" r="4"></circle>
                    <circle cx="370" cy="75" r="4"></circle>
                    <circle cx="420" cy="160" r="4"></circle>
                    <circle cx="240" cy="170" r="4"></circle>
                  </g>
                </svg>
                <span id="mapBadge"></span>
              </div>
              <div className="carouselHeading">
                <button id="prevRoad" aria-label="Previous road">
                  {"❮"}
                </button>
                <div>
                  <h3 id="roadTitle" aria-live="polite"></h3>
                  <p id="roadCount"></p>
                </div>
                <button id="nextRoad" aria-label="Next road">
                  {"❯"}
                </button>
              </div>
              <p id="roadDescription" className="intro"></p>
              <div
                id="roadChoices"
                className="choiceGrid"
                aria-label="All roads"
              ></div>
            </section>
            <section data-screen="weather" hidden={true}>
              <span className="eyebrow">{"03 / SET THE WEATHER"}</span>
              <h2>{"Choose your weather"}</h2>
              <p className="intro">
                {"See your selected road in a different light."}
              </p>
              <div
                id="weatherPreview"
                className="mapPreview"
                role="img"
                aria-label="Countryside road preview"
              >
                <svg viewBox="0 0 480 230" aria-hidden="true">
                  <circle className="mapSun" cx="385" cy="42" r="23"></circle>
                  <path
                    className="mapHills"
                    d="M0 110L75 35L157 106L270 18L365 112L450 45L480 90V230H0Z"
                  ></path>
                  <path
                    className="mapGround"
                    d="M0 130Q150 85 480 123V230H0Z"
                  ></path>
                  <path
                    d="M105 240C90 175 360 160 252 104L238 84"
                    fill="none"
                    stroke="#c5cebf"
                    strokeWidth="61"
                  ></path>
                  <path
                    d="M105 240C90 175 360 160 252 104L238 84"
                    fill="none"
                    stroke="#34444a"
                    strokeWidth="52"
                  ></path>
                  <path
                    d="M105 240C90 175 360 160 252 104L238 84"
                    fill="none"
                    stroke="#f3dc8a"
                    strokeWidth="3"
                    strokeDasharray="12 10"
                  ></path>
                  <g className="mapCity" fill="#314654">
                    <path d="M10 132V53H53V130M62 119V22H99V117M366 120V35H405V123M420 130V63H469V136"></path>
                  </g>
                  <g className="mapTrees" fill="#233f38">
                    <path d="M18 148L42 75L67 148ZM83 134L102 65L125 134ZM352 157L380 79L407 157ZM419 176L449 83L479 176Z"></path>
                  </g>
                  <g className="mapRain" stroke="#afdef2" strokeWidth="2">
                    <path d="M40 10L25 40M110 50L95 80M180 10L165 40M270 30L255 60M350 10L335 40M440 70L425 100M120 130L105 160M310 150L295 180"></path>
                  </g>
                  <g className="mapSnow" fill="white">
                    <circle cx="40" cy="35" r="4"></circle>
                    <circle cx="150" cy="75" r="4"></circle>
                    <circle cx="250" cy="35" r="4"></circle>
                    <circle cx="370" cy="75" r="4"></circle>
                    <circle cx="420" cy="160" r="4"></circle>
                    <circle cx="240" cy="170" r="4"></circle>
                  </g>
                </svg>
                <span id="weatherMapBadge"></span>
              </div>
              <div className="carouselHeading weatherCard">
                <button id="prevWeather" aria-label="Previous weather">
                  {"\n                ❮\n              "}
                </button>
                <div>
                  <strong id="weatherTitle" aria-live="polite"></strong>
                  <p id="weatherDescription"></p>
                </div>
                <button id="nextWeather" aria-label="Next weather">
                  {"\n                ❯\n              "}
                </button>
              </div>
              <div
                id="weatherChoices"
                className="choiceGrid weatherChoices"
                aria-label="All weather conditions"
              ></div>
            </section>
            <section data-screen="mode" hidden={true}>
              <span className="eyebrow">{"04 / MAKE IT YOUR JOURNEY"}</span>
              <h2>{"Find your pace."}</h2>
              <p className="intro">
                {
                  "\n              Select a game mode, then press Next to review your journey.\n            "
                }
              </p>
              <div className="modeRow">
                <button className="pick active" data-mode="free">
                  <strong>{"Free ride"}</strong>
                  <small>{"Endless road + traffic"}</small>
                </button>
                <button className="pick" data-mode="race">
                  <strong>{"30-second race"}</strong>
                  <small>{"You + 4 opponents"}</small>
                </button>
                <button className="pick" data-mode="roam">
                  <strong>{"Open roam"}</strong>
                  <small>{"No barriers. Leave the road."}</small>
                </button>
              </div>
            </section>
            <section data-screen="ready" hidden={true}>
              <span className="eyebrow">{"ALL SET / THE ROAD IS YOURS"}</span>
              <h2>{"Ready when you are."}</h2>
              <div className="readyBanner">
                <span className="readyIcon">{"✓"}</span>
                <div>
                  <strong>{"YOUR JOURNEY IS READY"}</strong>
                  <small>{"One last look. Then the open road."}</small>
                </div>
              </div>
              <div id="journeySummary" className="selectionCard"></div>
              <p className="intro">
                {
                  "\n              ↑ Accelerate · ↓ Reverse · ← / →\n              Steer"
                }
                <br />
                {"Space: Brake · Ctrl: Turbo · R: Center"}
                <br />
                {
                  "W:\n              Weather · C: Camera · Esc: Pause\n            "
                }
              </p>
              <p className="intro">
                {"On touch screens, hold the driving controls."}
              </p>
            </section>
          </div>
          <div id="nextHint" className="nextHint"></div>
          <div className="pageActions">
            <button id="backBtn" className="secondary" hidden={true}>
              {"← Back"}
            </button>
            <button id="nextBtn" className="primary">
              {"START GAME →"}
            </button>
            <button id="startBtn" className="primary" hidden={true}>
              {"GO →"}
            </button>
          </div>
        </main>
      </section>
    </>
  );
}
