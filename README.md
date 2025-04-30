# 🚀 Local LLM Content Creator

A full-stack application for generating content using local LLMs powered by Ollama and Mistral.

### HOW TO RUN THE APP

# RUN PYTHON FLASK BACKEND

1. Navigate to the `content` directory:

   ```bash
   cd content
   ```

2. Create and activate a Python virtual environment:

   ```bash
   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   .\venv\Scripts\activate
   ```

3. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the Flask backend server:
   ```bash
   python app.py
   ```

The backend will start on http://localhost:4000

# RUN NEXT.JS FRONTEND

1. Navigate to the `content_next` directory:

   ```bash
   cd content_next
   ```

2. Install Node dependencies:

   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:3000

# REQUIREMENTS

- Python 3.8+
- Node.js 18+
- Ollama installed and running with mistral:latest model
  ```bash
  ollama pull mistral:latest
  ```

# ARCHITECTURE

- Backend: Python Flask server that interfaces with Ollama API
- Frontend: Next.js 13+ app with React server components
- LLM: Ollama running mistral:latest model locally
