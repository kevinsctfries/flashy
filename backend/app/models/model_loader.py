from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM, T5Tokenizer
import torch
import nltk
from nltk.tokenize import sent_tokenize

# Download punkt tokenizer for sentence splitting
nltk.download('punkt')
nltk.download('punkt_tab')

# === CUDA Check ===
print("Uses CUDA:", torch.cuda.is_available())
if torch.cuda.is_available():
    print(torch.cuda.get_device_name(0))

# === Summarization Pipeline ===
summarization_pipeline = pipeline(
    task="summarization",
    model="facebook/bart-large-cnn",
    device=0 if torch.cuda.is_available() else -1
)

# === Question Generation ===
qg_tokenizer = T5Tokenizer.from_pretrained("valhalla/t5-base-qg-hl")
qg_model = AutoModelForSeq2SeqLM.from_pretrained("valhalla/t5-base-qg-hl")
qg_model.to("cuda" if torch.cuda.is_available() else "cpu")

# === Question Answering ===
qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2", device=0 if torch.cuda.is_available() else -1)


def summarize_text(text):
    input_tokens = qg_tokenizer.encode(text, return_tensors="pt")
    token_count = input_tokens.shape[1]

    print(f"Token count: {token_count}")

    max_length = min(0.5 * token_count, 512)
    min_length = max(30, int(max_length * 0.7))

    summary = summarization_pipeline(
        text,
        max_length=int(max_length),
        min_length=int(min_length),
        do_sample=True,
        num_beams=4,
        early_stopping=True
    )
    return summary[0]['summary_text']


def answer_question(context: str, question: str) -> str:
    try:
        result = qa_pipeline(question=question, context=context)
        return result['answer']
    except Exception as e:
        print(f"Answering failed: {e}")
        return "Could not generate answer."


def generate_question(context: str) -> str:
    device_str = "cuda" if torch.cuda.is_available() else "cpu"
    formatted_input = f"generate question: {context}"
    input_ids = qg_tokenizer.encode(formatted_input, return_tensors="pt").to(device_str)
    output_ids = qg_model.generate(
        input_ids=input_ids,
        max_length=64,
        num_beams=4,
        early_stopping=True
    )
    return qg_tokenizer.decode(output_ids[0], skip_special_tokens=True)


def split_semantic_chunks(text: str, max_tokens: int = 100) -> list[str]:
    sentences = sent_tokenize(text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        combined = f"{current_chunk} {sentence}".strip()
        token_len = len(qg_tokenizer.encode(combined))
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
            question = generate_question(chunk)
            if not question.strip():
                continue

            answer = answer_question(chunk, question)
            if not answer.strip() or answer.lower() == "[cls]":
                continue

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
