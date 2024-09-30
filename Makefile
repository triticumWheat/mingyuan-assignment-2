install:
    pip install -r backend/requirements.txt
    cd frontend && npm install

run:
    cd frontend && npm start &
    cd backend && python app.py
