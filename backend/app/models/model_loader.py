import os
from pathlib import Path
import nltk
from nltk.tokenize import sent_tokenize
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import signal
from functools import wraps
from threading import Event
import multiprocessing
import json
import shutil

MODEL_NAME = "potsawee/t5-large-generation-squad-QuestionAnswer"

download_interrupt = Event()

class ModelDownloadStatus:
    def __init__(self):
        self.status = "idle"
        self.error_message = None
        self.canceled = False

    def cancel(self):
        print("Setting download status to canceled")
        self.canceled = True
        self.status = "canceled"
        self.error_message = "Download canceled"
        download_interrupt.set()
        try:
            model_path = os.path.join(MODEL_DIR, MODEL_NAME.split('/')[-1])
            if os.path.exists(model_path):
                import shutil
                shutil.rmtree(model_path)
                print(f"Cleaned up partial downloads at: {model_path}")
        except Exception as e:
            print(f"Error cleaning up downloads: {e}")

download_status = ModelDownloadStatus()
qa_tokenizer = None
qa_model = None

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

cuda_available = torch.cuda.is_available()
device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU"
print("Uses CUDA:", cuda_available)
if cuda_available:
    print(device_name)

def check_model_downloaded():
    try:
        model_path = os.path.join(MODEL_DIR, MODEL_NAME.split('/')[-1])
        print(f"Checking model at: {model_path}")
        
        if not os.path.exists(model_path):
            print(f"Model directory does not exist at: {model_path}")
            return False
            
        print("Files in model directory:")
        for root, files in os.walk(model_path):
            for file in files:
                print(f"- {os.path.join(root, file)}")
            
        required_files = [
            "config.json",
            "tokenizer_config.json",
            "special_tokens_map.json",
            "tokenizer.json"
        ]
        
        model_file_found = (
            os.path.exists(os.path.join(model_path, "pytorch_model.bin")) or
            os.path.exists(os.path.join(model_path, "model.safetensors"))
        )
        
        if not model_file_found:
            print("Missing model weights file (neither pytorch_model.bin nor model.safetensors found)")
            return False
            
        for file in required_files:
            file_path = os.path.join(model_path, file)
            if not os.path.exists(file_path):
                print(f"Missing required file: {file}")
                return False
                
        print("All model files found successfully")
        return True
        
    except Exception as e:
        print(f"Error checking model files: {e}")
        return False

class ModelDownloadProcess(multiprocessing.Process):
    def __init__(self, model_path):
        super().__init__()
        self.model_path = model_path
        self.status_file = os.path.join(os.path.dirname(model_path), 'download_status.json')

    def update_status(self, status: str, error: str = None):
        """Update the download status in the status file"""
        try:
            with open(self.status_file, 'w') as f:
                json.dump({
                    'status': status,
                    'error': error,
                    'pid': self.pid
                }, f)
        except Exception as e:
            print(f"Error updating status: {e}")

    def run(self):
        try:
            self.update_status('downloading')
            
            if os.path.exists(self.model_path):
                shutil.rmtree(self.model_path)
            os.makedirs(self.model_path, exist_ok=True)
            
            os.environ['TRANSFORMERS_CACHE'] = self.model_path
            os.environ['HF_HOME'] = self.model_path
            os.environ.pop('TRANSFORMERS_OFFLINE', None)
            os.environ.pop('HF_HUB_OFFLINE', None)
            
            tokenizer = AutoTokenizer.from_pretrained(
                MODEL_NAME,
                use_fast=True,
                force_download=True,
                local_files_only=False,
                cache_dir=self.model_path
            )
            tokenizer.save_pretrained(self.model_path)
            
            model = AutoModelForSeq2SeqLM.from_pretrained(
                MODEL_NAME,
                force_download=True,
                local_files_only=False,
                use_safetensors=True,
                cache_dir=self.model_path
            )
            model.save_pretrained(self.model_path, safe_serialization=True)
            
            if check_model_downloaded():
                self.update_status('complete')
            else:
                raise Exception("Model files verification failed after download")
            
        except Exception as e:
            self.update_status('error', str(e))
            if os.path.exists(self.model_path):
                shutil.rmtree(self.model_path)

def download_model(token: str = None):
    global download_status
    download_status.status = "downloading"
    download_status.canceled = False
    download_status.error_message = None
    
    model_path = os.path.join(MODEL_DIR, MODEL_NAME.split('/')[-1])
    if os.path.exists(model_path):
        shutil.rmtree(model_path)
    os.makedirs(model_path, exist_ok=True)
    
    try:
        download_process = ModelDownloadProcess(model_path)
        download_process.start()
        
        status_file = os.path.join(os.path.dirname(model_path), 'download_status.json')
        while download_process.is_alive():
            if download_status.canceled:
                download_process.terminate()
                download_process.join(timeout=2.0)
                if download_process.is_alive():
                    os.kill(download_process.pid, signal.SIGKILL)
                if os.path.exists(model_path):
                    shutil.rmtree(model_path)
                if os.path.exists(status_file):
                    os.remove(status_file)
                download_status.status = "canceled"
                return False
            
            if os.path.exists(status_file):
                with open(status_file) as f:
                    status = json.load(f)
                    if status['status'] == 'error':
                        download_status.error_message = status['error']
                    elif status['status'] == 'complete':
                        if check_model_downloaded():
                            download_status.status = "complete"
                            return True
            
            download_process.join(timeout=0.1)
        
        if os.path.exists(status_file):
            os.remove(status_file)
        
        if check_model_downloaded():
            download_status.status = "complete"
            return True
        else:
            download_status.status = "error"
            download_status.error_message = "Download process ended without completing"
            return False
            
    except Exception as e:
        download_status.status = "error"
        download_status.error_message = str(e)
        return False

def get_download_progress():
    return {
        "status": download_status.status,
        "error_message": download_status.error_message
    }

def initialize_model():
    global qa_tokenizer, qa_model
    
    try:
        model_path = os.path.join(MODEL_DIR, MODEL_NAME.split('/')[-1])
        print("=== Model Initialization Debug ===")
        print(f"Model path: {model_path}")
        print(f"MODEL_DIR: {MODEL_DIR}")
        print(f"Current working directory: {os.getcwd()}")
        
        if not check_model_downloaded():
            print("Model files not found")
            if os.path.exists(model_path):
                print("Files in model directory:")
                print('\n'.join(os.listdir(model_path)))
            return False
        
        print("✓ Model files found")
        
        if qa_tokenizer is None or qa_model is None:
            print("Loading model and tokenizer...")
            
            os.environ['TRANSFORMERS_OFFLINE'] = '1'
            
            qa_tokenizer = AutoTokenizer.from_pretrained(
                model_path,
                local_files_only=True,
                use_fast=False
            )
            
            qa_model = AutoModelForSeq2SeqLM.from_pretrained(
                model_path,
                local_files_only=True
            )
            
            device = "cuda" if torch.cuda.is_available() else "cpu"
            qa_model.to(device)
            print(f"Model loaded successfully on {device}")
            return True
            
        return True
        
    except Exception as e:
        print(f"Error initializing model: {e}")
        return False

def generate_qa_pair(context: str) -> tuple[str, str] | None:
    if qa_model is None or qa_tokenizer is None:
        print("Model not initialized, attempting to initialize...")
        if not initialize_model():
            raise RuntimeError("Model not initialized. Please download the model first.")
    
    try:
        os.environ['TRANSFORMERS_OFFLINE'] = '1'
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        print(f"Generating Q&A for context length: {len(context)}")
        print(f"Using device: {device}")
        
        qa_model.to(device)
        
        inputs = qa_tokenizer(context, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        outputs = qa_model.generate(**inputs, max_length=100)
        
        outputs = outputs.cpu()
        decoded = qa_tokenizer.decode(outputs[0], skip_special_tokens=False)
        
        cleaned = decoded.replace(qa_tokenizer.pad_token, "").replace(qa_tokenizer.eos_token, "")
        if qa_tokenizer.sep_token in cleaned:
            question, answer = cleaned.split(qa_tokenizer.sep_token)
            return question.strip(), answer.strip()
        else:
            print(f"Missing separator token in output: {cleaned}")
            return None
            
    except Exception as e:
        print(f"Q&A generation error: {e}")
        return None


def split_semantic_chunks(text: str, max_tokens: int = 100) -> list[str]:
    if qa_tokenizer is None or not check_model_downloaded():
        raise RuntimeError("Model not initialized or not downloaded")
    
    os.environ['TRANSFORMERS_OFFLINE'] = '1'
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        combined = f"{current_chunk} {sentence}".strip()
        token_len = len(qa_tokenizer.encode(combined))
        if token_len > max_tokens and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            current_chunk = combined

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def generate_flashcards(text: str, max_questions: int = 5) -> list[dict]:
    chunks = split_semantic_chunks(text)
    flashcards = []

    for chunk in chunks:
        try:
            result = generate_qa_pair(chunk)
            if result:
                question, answer = result
                if question and answer:
                    flashcards.append({
                        "question": question,
                        "answer": answer
                    })

            if len(flashcards) >= max_questions:
                break

        except Exception as e:
            print(f"Flashcard generation error: {e}")
            continue

    return flashcards