import React, { useState } from 'react';

const ControlPanel = ({ method, setMethod, generateData, runKMeans, setK }) => {
  const [kValue, setKValue] = useState(3);

  const handleKChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setKValue(value);
    setK(value);
  };

  return (
    <div className="control-panel">
      <label>Initialization Method: </label>
      <select value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="random">random</option>
        <option value="farthest-first">Farthest First</option>
        <option value="kmeans++">KMeans++</option>
        <option value="manual">manual</option>
      </select>

      <label>Numbers of Clusters (k): </label>
      <input type="number" value={kValue} min="1" max="10" onChange={handleKChange} />

      <button onClick={generateData}>Generate New Dataset</button>
    </div>
  );
};

export default ControlPanel;