import TimerDisplay from "../../components/TimerDisplay";

const Countdown = () => {
  return (
    <div
      className="countdown-screen"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <TimerDisplay />
    </div>
  );
};

export default Countdown;
