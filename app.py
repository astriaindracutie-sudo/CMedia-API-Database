import os
import google.generativeai as genai

# Read the API key from the environment variable
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API key not found. Please set the GEMINI_API_KEY environment variable.")
else:
    genai.configure(api_key=api_key)
    # Your code for using the Gemini API goes here
    # model = genai.GenerativeModel('gemini-flash')
    # response = model.generate_content("What is the capital of France?")
    # print(response.text)
