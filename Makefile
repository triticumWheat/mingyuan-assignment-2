install:
	pip install -r backend/requirements.txt
	cd kmeans-visualizer && npm install

run:
	cd kmeans-visualizer && npm start &
	cd backend && python app.py
