from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import random

app = Flask(__name__)
CORS(app)

DATAPOINTS = []
CENTROIDS = []

@app.route('/api/generate-data', methods=['GET'])
def generate_data():
    global DATAPOINTS
    DATAPOINTS = np.random.rand(100, 2).tolist()
    return jsonify({'points': DATAPOINTS})

@app.route('/api/kmeans-step', methods=['POST'])
def kmeans_step():
    global data_points, centroids
    content = request.json
    method = content.get('method')
    k = content.get('k')
    step = content.get('step')
    data = np.array(content.get('data'))
    centroids = np.array(content.get('centroids'))

    if step == 0 and method != 'manual':
        if method == 'random':
            centroids = initialize_random(data, k)
        elif method == 'farthest-first':
            centroids = initialize_farthest_first(data, k)
        elif method == 'kmeans++':
            centroids = initialize_kmeans_plus_plus(data, k)
        converged = False
    else:
        prev_centroids = centroids.copy()
        centroids = kmeans_step_function(data, centroids)
        converged = np.allclose(centroids, prev_centroids)

    assignments = assign_clusters(data, centroids)

    return jsonify({
        'centroids': centroids.tolist(),
        'assignments': assignments.tolist(),
        'converged': converged
    })

@app.route('/api/kmeans-converge', methods=['POST'])
def kmeans_converge():
    content = request.json
    method = content.get('method')
    k = content.get('k')
    data = np.array(content.get('data'))

    if method == 'random':
        centroids = initialize_random(data, k)
    elif method == 'farthest-first':
        centroids = initialize_farthest_first(data, k)
    elif method == 'kmeans++':
        centroids = initialize_kmeans_plus_plus(data, k)

    for _ in range(100):
        prev_centroids = centroids.copy()
        centroids = kmeans_step_function(data, centroids)
        if np.allclose(centroids, prev_centroids):
            break

    assignments = assign_clusters(data, centroids)
    return jsonify({
        'centroids': centroids.tolist(),
        'assignments': assignments.tolist()
    })

def initialize_random(data, k=3):
    return data[np.random.choice(data.shape[0], k, replace=False)]

def initialize_farthest_first(data, k=3):
    centroids = [random.choice(data)]
    for _ in range(1, k):
        distances = np.array([
            min([np.linalg.norm(x - c) for c in centroids]) for x in data
        ])
        next_centroid = data[np.argmax(distances)]
        centroids.append(next_centroid)
    return np.array(centroids)

def initialize_kmeans_plus_plus(data, k=3):
    centroids = [random.choice(data)]
    for _ in range(1, k):
        distances = np.array([
            min([np.linalg.norm(x - c) for c in centroids])**2 for x in data
        ])
        probabilities = distances / distances.sum()
        cumulative_probabilities = probabilities.cumsum()
        r = random.random()
        for index, cumulative_probability in enumerate(cumulative_probabilities):
            if r < cumulative_probability:
                centroids.append(data[index])
                break
    return np.array(centroids)

def assign_clusters(data, centroids):
    distances = np.array([
        [np.linalg.norm(x - c) for c in centroids] for x in data
    ])
    return np.argmin(distances, axis=1)

def kmeans_step_function(data, centroids):
    assignments = assign_clusters(data, centroids)
    new_centroids = np.array([
        data[assignments == i].mean(axis=0) if len(data[assignments == i]) > 0 else centroids[i]
        for i in range(len(centroids))
    ])
    return new_centroids

if __name__ == '__main__':
    app.run(port=3001)