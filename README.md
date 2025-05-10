# Flashy

Flashy is an AI-powered flashcard generator that helps you learn and retain information more efficiently. Upload text or documents and get instant flashcards—perfect for students, educators, and lifelong learners.

---

## Features

- AI-generated questions and answers
- Flashcard-style interface for easy review
- Responsive and modern UI built with Angular
- Lightweight backend using Flask

---

## Tech Stack

- **Frontend:** Angular
- **Backend:** Flask (Python)
- **Styling:** SCSS with CSS variables for dark/light mode

---

## Project Structure

```
flashy/
├── frontend/     # Angular app
└── backend/      # Flask API
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/flashy.git
cd flashy
```

### 2. Set up the backend (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate     # or venv\Scripts\activate on Windows
pip install -r requirements.txt
flask run
```

> Ensure you have Python 3.8+ and Flask installed. Set any required environment variables if needed.

### 3. Set up the frontend (Angular)

In a separate terminal:

```bash
cd frontend
npm install
ng serve
```

> This will start the Angular app at [http://localhost:4200](http://localhost:4200)

---

## Development Tips

- Angular files live inside `/frontend/src/app`
- Flask routes and logic live inside `/backend/app.py` (or similar)
- Make sure CORS is enabled on the Flask server if testing frontend and backend separately

---

## License

MIT License

---

## Future Features

- User authentication
- Flashcard decks and tagging
- Export to Anki or Quizlet
- Enhanced NLP with summarization + QA pipelines

---

## Built by Kevin Fries

Open source and built with by a lifelong learner.
