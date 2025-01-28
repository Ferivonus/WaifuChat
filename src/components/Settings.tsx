interface SettingsProps {
  selectedCharacter: string;
  onCharacterSelect: (character: string) => void;
}

const Settings = ({ selectedCharacter, onCharacterSelect }: SettingsProps) => {
  return (
    <div className="container">
      <div className="settings-content">
        <h2>Settings</h2>
        
        <div className="setting-item">
          <label>AI Model</label>
          <select defaultValue="deepseek-r1:7b">
            <option value="deepseek-r1:7b">DeepSeek R1 7B</option>
            <option value="lain-protocol-v2">Lain Protocol v2</option>
          </select>
        </div>

        <div className="setting-item">
          <label>Character Selection</label>
          <div className="character-grid">
            {['lain', 'mikasa', 'saber', 'asuna', 'erza'].map((character) => (
              <button
                key={character}
                className={`character-select ${character === selectedCharacter ? 'selected' : ''}`}
                onClick={() => onCharacterSelect(character)}
              >
                <img
                  src={`/sprites/${character}-avatar.png`}
                  alt={character}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;