import React, { useEffect, useState } from 'react';
import Plotly from 'plotly.js-dist';

const Visualization = ({ data, centroids, assignments, addManualCentroid }) => {
  const [manualSelectionMode, setManualSelectionMode] = useState(false);

  useEffect(() => {
    if (data.length === 0) return;

    const clusterColors = ['blue', 'red', 'green', 'orange', 'purple', 'brown', 'pink', 'gray', 'yellow', 'cyan'];

    const traces = assignments.length > 0
      ? centroids.map((_, clusterIndex) => ({
          x: data.filter((_, i) => assignments[i] === clusterIndex).map(point => point[0]),
          y: data.filter((_, i) => assignments[i] === clusterIndex).map(point => point[1]),
          mode: 'markers',
          type: 'scatter',
          marker: { color: clusterColors[clusterIndex % clusterColors.length], size: 8 },
          name: `cluster ${clusterIndex + 1}`
        }))
      : [{
          x: data.map(point => point[0]),
          y: data.map(point => point[1]),
          mode: 'markers',
          type: 'scatter',
          marker: { color: 'blue', size: 8 },
          name: 'datapoint'
        }];

    const centroidTrace = {
      x: centroids.map(centroid => centroid[0]),
      y: centroids.map(centroid => centroid[1]),
      mode: 'markers',
      type: 'scatter',
      marker: { color: 'black', size: 12, symbol: 'x' },
      name: 'centroids'
    };

    const layout = {
      title: 'KMeans Clustering Animation',
      xaxis: { title: 'X' },
      yaxis: { title: 'Y' }
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.newPlot('visualization', [...traces, centroidTrace], layout, config);

    const visualizationDiv = document.getElementById('visualization');
    visualizationDiv.on('plotly_click', function(data) {
      if (manualSelectionMode) {
        const x = data.points[0].x;
        const y = data.points[0].y;
        addManualCentroid([x, y]);
      }
    });

    return () => {
      visualizationDiv.removeAllListeners('plotly_click');
    };
  }, [data, centroids, assignments, manualSelectionMode]);

  const enableManualSelection = () => {
    setManualSelectionMode(true);
  };

  return (
    <div>
      {manualSelectionMode && <p>Click to select centroids</p>}
      <button onClick={enableManualSelection}>start selecting centroids manually</button>
      <div id="visualization" style={{ width: '100%', height: '600px' }} />
    </div>
  );
};

export default Visualization;