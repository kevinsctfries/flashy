from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import nltk
from nltk.tokenize import sent_tokenize

# Download punkt tokenizer
nltk.download('punkt')

# === CUDA Check ===
print("Uses CUDA:", torch.cuda.is_available())
if torch.cuda.is_available():
    print(torch.cuda.get_device_name(0))

# === Combined Q&A Model ===
qa_tokenizer = AutoTokenizer.from_pretrained("potsawee/t5-large-generation-squad-QuestionAnswer")
qa_model = AutoModelForSeq2SeqLM.from_pretrained("potsawee/t5-large-generation-squad-QuestionAnswer")
qa_model.to("cuda" if torch.cuda.is_available() else "cpu")


def generate_qa_pair(context: str) -> tuple[str, str] | None:
    try:
        device_str = "cuda" if torch.cuda.is_available() else "cpu"
        inputs = qa_tokenizer(context, return_tensors="pt").to(device_str)
        outputs = qa_model.generate(**inputs, max_length=100)
        decoded = qa_tokenizer.decode(outputs[0], skip_special_tokens=False)

        # Remove padding/eos tokens, then split on the sep_token
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
