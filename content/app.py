from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import sys
import requests
from content_agent import ContentAgent

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the content agent
print("\n" + "="*70)
print("🚀 Starting Content Creator Python Backend")
print("="*70)
content_agent = ContentAgent()
print("✅ ContentAgent initialized successfully")
print("="*70 + "\n")

@app.route('/plan', methods=['POST'])
def plan_content():
    print("\n" + "-"*50)
    print("📋 PLAN CONTENT ENDPOINT CALLED")
    start_time = time.time()
    
    try:
        data = request.json
        topic = data.get('topic')
        
        print(f"📌 Topic received: {topic}")
        
        if not topic:
            print("❌ Error: Topic is required")
            return jsonify({'error': 'Topic is required'}), 400
        
        print("🔄 Calling ContentAgent.plan_content()...")
        plan = content_agent.plan_content(topic)
        
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"✅ Plan generated successfully in {time_taken:.2f} seconds")
        print(f"📊 Plan length: {len(plan)} characters")
        print("-"*50 + "\n")
        
        return jsonify({'plan': plan})
    
    except Exception as e:
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"❌ Error planning content after {time_taken:.2f} seconds: {str(e)}")
        print("-"*50 + "\n")
        return jsonify({'error': str(e)}), 500

@app.route('/write', methods=['POST'])
def write_content():
    print("\n" + "-"*50)
    print("✍️ WRITE CONTENT ENDPOINT CALLED")
    start_time = time.time()
    
    try:
        data = request.json
        topic = data.get('topic')
        plan = data.get('plan')
        
        print(f"📌 Topic received: {topic}")
        print(f"📌 Plan received: {plan[:100]}...")
        
        if not topic or not plan:
            print("❌ Error: Topic and plan are required")
            return jsonify({'error': 'Topic and plan are required'}), 400
        
        print("🔄 Calling ContentAgent.write_content()...")
        content = content_agent.write_content(topic, plan)
        
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"✅ Content written successfully in {time_taken:.2f} seconds")
        print(f"📊 Content length: {len(content)} characters")
        print("-"*50 + "\n")
        
        return jsonify({'content': content})
    
    except Exception as e:
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"❌ Error writing content after {time_taken:.2f} seconds: {str(e)}")
        print("-"*50 + "\n")
        return jsonify({'error': str(e)}), 500

@app.route('/edit', methods=['POST'])
def edit_content():
    print("\n" + "-"*50)
    print("✏️ EDIT CONTENT ENDPOINT CALLED")
    start_time = time.time()
    
    try:
        data = request.json
        draft = data.get('draft')
        
        print(f"📌 Draft received: {draft[:100]}...")
        
        if not draft:
            print("❌ Error: Draft content is required")
            return jsonify({'error': 'Draft content is required'}), 400
        
        print("🔄 Calling ContentAgent.edit_content()...")
        edited_content = content_agent.edit_content(draft)
        
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"✅ Content edited successfully in {time_taken:.2f} seconds")
        print(f"📊 Edited content length: {len(edited_content)} characters")
        print("-"*50 + "\n")
        
        return jsonify({'content': edited_content})
    
    except Exception as e:
        end_time = time.time()
        time_taken = end_time - start_time
        print(f"❌ Error editing content after {time_taken:.2f} seconds: {str(e)}")
        print("-"*50 + "\n")
        return jsonify({'error': str(e)}), 500

@app.route('/status', methods=['GET'])
def status():
    print("\n" + "-"*50)
    print("ℹ️ STATUS ENDPOINT CALLED")
    
    try:
        # Check if Ollama is running
        response = requests.get('http://localhost:11434/api/tags')
        ollama_status = "running" if response.status_code == 200 else "not running"
        
        # Get available models
        models = response.json().get('models', []) if response.status_code == 200 else []
        model_names = [model.get('name') for model in models] if models else []
        
        status_info = {
            'status': 'ok',
            'ollama_status': ollama_status,
            'available_models': model_names,
            'current_model': content_agent.model,
            'api_url': content_agent.api_url
        }
        
        print(f"✅ Status check successful: {status_info}")
        print("-"*50 + "\n")
        
        return jsonify(status_info)
    
    except Exception as e:
        print(f"❌ Error checking status: {str(e)}")
        print("-"*50 + "\n")
        
        return jsonify({
            'status': 'error',
            'ollama_status': 'unknown',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4000))
    print(f"🌐 Starting Flask server on port {port}...")
    print(f"📌 API will be available at http://localhost:{port}")
    print(f"📌 Make sure Ollama is running and the model '{content_agent.model}' is available")
    print(f"📌 Press Ctrl+C to stop the server")
    print("\n" + "="*70)
    app.run(host='0.0.0.0', port=port, debug=True)
