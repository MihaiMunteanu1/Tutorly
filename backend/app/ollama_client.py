import ollama

class OllamaTeacher:
    def __init__(self):
        self.name = 'math-llama'

    def ask(self, question):
        system_prompt  = """You are a deterministic mathematical engine. You are not a chat assistant. You do not think, you only calculate and output.

STRICT OUTPUT PROTOCOL:
1. DISABLE ALL INTERNAL MONOLOGUE. Do not use <think>, <thought>, or <<...>> tags.
2. Do not use filler phrases like "Let me see", "Hmm", "Here is the solution", or "Let's calculate".
3. Immediate execution only.

CLASSIFICATION & FORMAT:
[TYPE A] Basic Arithmetic / Facts
- Output: THE RESULT ONLY.
- Example User: "2+2"
- Example Output: 4

[TYPE B] Complex Reasoning / Word Problems
- Output: "Step-by-step reasoning:" followed by the logic, then "Final Answer: [Result]"
- Keep reasoning mechanical and direct.

Generate the response for the following input immediately:
"""

        try:
            stream = ollama.chat(
                model=self.name,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': question},
                ],
                stream=True,
            )

            full_response = ""
            for chunk in stream:
                content = chunk['message']['content']
                print(content, end="", flush=True)
                full_response += content

            print("\n" + "-" * 50)
            return full_response

        except Exception as e:
            print(f"\n\n cannot connect to ollama server")
            print(f"details: {e}")
