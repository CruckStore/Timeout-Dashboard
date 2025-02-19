import GlobalSettings from './GlobalSettings';
import MainScreenSettings from './MainScreenSettings';
import SecondaryScreenSettings from './SecondaryScreenSettings';

const EmitterSettings = () => {
  return (
    <div className="emitter-settings">
      <h1>Settings</h1>
      <div className="settings-cards">
        <GlobalSettings />
        <MainScreenSettings />
        <SecondaryScreenSettings />
      </div>
    </div>
  );
};

export default EmitterSettings;