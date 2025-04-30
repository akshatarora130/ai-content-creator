import requests
import json
import os
import time
import sys

class ContentAgent:
    def __init__(self):
        # Ollama API endpoint (default for local installation)
        self.api_url = os.environ.get('OLLAMA_API_URL', 'http://localhost:11434/api/generate')
        # Use only mistral:latest as specified
        self.model = "mistral:latest"
        
        print(f"🚀 Initializing ContentAgent with model: {self.model}")
        print(f"🔗 API URL: {self.api_url}")
        
        # Check if Ollama is running and the model is available
        self._check_ollama_status()
    
    def _check_ollama_status(self):
        """Check if Ollama is running and the model is available"""
        print("🔍 Checking Ollama status...")
        try:
            # Simple request to check if Ollama is running
            print("   Connecting to Ollama service...")
            response = requests.get('http://localhost:11434/api/tags')
            if response.status_code != 200:
                print("⚠️ Warning: Ollama service doesn't seem to be running properly")
                print(f"   Status code: {response.status_code}")
                return
            
            print("✅ Connected to Ollama service")
            
            # Check if the model is available
            models = response.json().get('models', [])
            model_names = [model.get('name') for model in models]
            
            print(f"📋 Available models: {', '.join(model_names) or 'None'}")
            
            if self.model not in model_names:
                print(f"⚠️ Warning: Model '{self.model}' not found.")
                print(f"   You may need to run: ollama pull {self.model}")
            else:
                print(f"✅ Model '{self.model}' is available")
        except Exception as e:
            print(f"❌ Could not connect to Ollama: {str(e)}")
            print("   Make sure Ollama is installed and running")
    
    def _generate_response(self, prompt, system_prompt=None, max_tokens=400):
        """Generate a response from Ollama with detailed logging"""
        headers = {'Content-Type': 'application/json'}
        
        payload = {
            'model': self.model,
            'prompt': prompt,
            'stream': False,
            'max_tokens': max_tokens,
            'temperature': 0.3,  # Lower temperature for more deterministic and faster responses
            'top_p': 0.6,        # Lower top_p for faster generation
            'top_k': 30,         # Lower top_k for faster generation
        }
        
        if system_prompt:
            payload['system'] = system_prompt
        
        # Log request details
        print("\n" + "="*50)
        print(f"🔄 Sending request to Ollama ({self.model})")
        print(f"📝 System prompt: {system_prompt[:100] + '...' if system_prompt and len(system_prompt) > 100 else system_prompt or 'None'}")
        print(f"📝 User prompt: {prompt[:100] + '...' if len(prompt) > 100 else prompt}")
        print(f"⚙️ Max tokens: {max_tokens}")
        
        # Track time
        start_time = time.time()
        print("⏱️ Starting request...")
        
        try:
            # Send request to Ollama without timeout
            response = requests.post(self.api_url, headers=headers, data=json.dumps(payload))
            response.raise_for_status()
            
            # Calculate time taken
            end_time = time.time()
            time_taken = end_time - start_time
            
            # Get response
            result = response.json()
            response_text = result.get('response', '')
            
            # Log response details
            print(f"✅ Response received in {time_taken:.2f} seconds")
            print(f"📊 Response length: {len(response_text)} characters")
            print(f"📊 First 100 chars: {response_text[:100] + '...' if len(response_text) > 100 else response_text}")
            
            # Log any additional information from Ollama
            if 'eval_count' in result:
                print(f"📊 Eval count: {result.get('eval_count')}")
            if 'eval_duration' in result:
                print(f"📊 Eval duration: {result.get('eval_duration')}")
            
            print("="*50 + "\n")
            
            return response_text
        except requests.exceptions.RequestException as e:
            print(f"❌ Error calling Ollama API: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print(f"   Response: {e.response.text}")
            print("="*50 + "\n")
            raise Exception(f"Failed to generate content: {str(e)}")
    
    def plan_content(self, topic):
        """Plan content based on a topic"""
        print(f"📋 Planning content for topic: {topic}")
        
        system_prompt = """You are a content planning assistant. Your job is to create extremely brief outlines. Be concise and direct. Keep everything as short as possible."""
        
        prompt = f"""
        Create a very brief content plan for a short article about: "{topic}"
        
        Include:
        1. A short title (max 6 words)
        2. 3 main bullet points (1 sentence each)
        3. A one-sentence conclusion
        
        IMPORTANT: Keep it extremely brief. The entire plan should be under 75 words. Be direct and concise.
        """
        
        return self._generate_response(prompt, system_prompt, max_tokens=200)
    
    def write_content(self, topic, plan):
        """Write content based on the topic and plan"""
        print(f"✍️ Writing content for topic: {topic}")
        print(f"   Using plan: {plan[:100]}...")
        
        system_prompt = """You are a content writer who specializes in extremely concise, crisp writing. Your content is brief but impactful. You never use unnecessary words."""
        
        prompt = f"""
        Write a very short article about: "{topic}"
        
        Follow this plan:
        {plan}
        
        IMPORTANT REQUIREMENTS:
        - Keep the entire article under 200 words
        - Use short paragraphs (1-2 sentences each)
        - Use simple language and short sentences
        - Be direct and to the point
        - Include a title and section headings
        - Do not include an introduction or conclusion section
        """
        
        return self._generate_response(prompt, system_prompt, max_tokens=400)
    
    def edit_content(self, draft):
        """Edit and improve the draft content"""
        print(f"✏️ Editing content draft: {draft[:100]}...")
        
        system_prompt = """You are an editor who specializes in making content shorter and more impactful. Cut unnecessary words ruthlessly."""
        
        prompt = f"""
        Edit this draft to make it shorter and more impactful:
        
        {draft}
        
        IMPORTANT REQUIREMENTS:
        1. Reduce the word count by at least 30%
        2. Remove any fluff or unnecessary words
        3. Make sentences shorter and more direct
        4. Ensure the main points remain clear
        5. Keep only the most essential information
        
        The final edited version should be extremely crisp, clear, and concise.
        """
        
        return self._generate_response(prompt, system_prompt, max_tokens=400)
