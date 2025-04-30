from transformers import pipeline, AutoTokenizer
import torch

# Check if CUDA is available
print("Uses Cuda:", torch.cuda.is_available())
print(torch.cuda.get_device_name(0))

summarization_pipeline = pipeline(
    task="summarization",
    model="google-t5/t5-small",
    device=0 if torch.cuda.is_available() else -1
)

tokenizer = AutoTokenizer.from_pretrained("google-t5/t5-small")


def summarize_text(text):
    input_tokens = tokenizer.encode(text, return_tensors="pt")
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
