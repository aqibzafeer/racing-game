export default function GameStage() {
  return (
    <>
      <div id="rotateDevice" role="status">
        <span aria-hidden="true">{"↻"}</span>
        <h2>{"Rotate to drive"}</h2>
        <p>{"Turn your phone sideways for the full Road Club experience."}</p>
      </div>
      <div id="game"></div>
      <div className="stageVignette" aria-hidden="true"></div>
      <div id="loading" role="status">
        {"Preparing your garage…"}
      </div>
    </>
  );
}
