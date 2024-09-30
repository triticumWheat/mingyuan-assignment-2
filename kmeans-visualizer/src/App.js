import React, { useState } from 'react';
import ControlPanel from './ControlPanel';
import Visualization from './Visualization';
import axios from 'axios';

const App = () => {
  const [method, setMethod] = useState('random');
  const [data, setData] = useState([]);
  const [centroids, setCentroids] = useState([]);
  const [k, setK] = useState(3);
  const [assignments, setAssignments] = useState([]);
  const [step, setStep] = useState(0);
  const [isConverged, setIsConverged] = useState(false);

  const generateData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/generate-data');
      setData(response.data.points);
      resetAlgorithm();
    } catch (error) {
      console.error('generate data fail', error);
    }
  };

  const resetAlgorithm = () => {
    setCentroids([]);
    setAssignments([]);
    setStep(0);
    setIsConverged(false);
  };

  const addManualCentroid = (centroid) => {
    if (method === 'manual' && centroids.length < k) {
      setCentroids([...centroids, centroid]);
    }
  };

  const runNextStep = async () => {
    if (isConverged) return;

    try {
      const response = await axios.post('http://localhost:3001/api/kmeans-step', {
        method,
        data,
        centroids,
        step,
        k
      });
      setCentroids(response.data.centroids);
      setAssignments(response.data.assignments);
      setStep(step + 1);

      if (response.data.converged) {
        setIsConverged(true);
      }
    } catch (error) {
      console.error('KMeans step fail', error);
    }
  };

  const runToConvergence = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/kmeans-converge', {
        method,
        data,
        centroids,
        k
      });
      setCentroids(response.data.centroids);
      setAssignments(response.data.assignments);
      setIsConverged(true);
    } catch (error) {
      console.error('run to convergence fail', error);
    }
  };

  return (
    <div className="App">
      <h1>KMeans Clustering Algorithm</h1>
      <ControlPanel
        method={method}
        setMethod={setMethod}
        generateData={generateData}
        runKMeans={runNextStep}
        setK={setK}
      />
      <Visualization
        data={data}
        centroids={centroids}
        assignments={assignments}
        addManualCentroid={addManualCentroid}
      />
      <button onClick={runNextStep}>Step Through KMeans</button>
      <button onClick={runToConvergence}>Run to Convergence</button>
      <button onClick={resetAlgorithm}>Reset Algorithm</button>
      {isConverged && <h2>Converged!</h2>}
    </div>
  );
};

export default App;