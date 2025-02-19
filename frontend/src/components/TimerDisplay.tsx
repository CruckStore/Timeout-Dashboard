import { useTimer } from "../context/TimerContext";
import { formatTime } from "../utils/timeUtils";

const TimerDisplay = () => {
  const { time } = useTimer();
  return <div className="ds-digital">{formatTime(time)}</div>;
};

export default TimerDisplay;
