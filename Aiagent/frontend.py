
# #all required dependecny to install 
# # pip install streamlit streamlit-webrtc speechrecognition langchain-google-genai
 

# # pip install streamlit streamlit-webrtc speechrecognition langchain-google-genai

# import streamlit as st
# import asyncio
# import os
# import sys
# from streamlit_mic_recorder import mic_recorder
# import requests
# import time
# import base64
# import json

# # Import your custom modules
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# from main import setup_browser, agent_loop
# from langchain_google_genai import ChatGoogleGenerativeAI

# # API KEYS
# GENAI_API_KEY = "AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo"  # Gemini
# ASSEMBLY_API_KEY = "5c4816e6d3b34495b46942a122bc07d4"  # AssemblyAI

# # Initialize session state for transcript
# if 'transcript' not in st.session_state:
#     st.session_state.transcript = ""
# if 'processing_audio' not in st.session_state:
#     st.session_state.processing_audio = False

# # Function to convert speech to text using AssemblyAI
# def speech_to_text(audio_data):
#     upload_endpoint = "https://api.assemblyai.com/v2/upload"
#     transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
#     headers = {
#         "authorization": ASSEMBLY_API_KEY,
#         "content-type": "application/json"
#     }
#     upload_headers = {
#         "authorization": ASSEMBLY_API_KEY
#     }
    
#     try:
#         # Convert audio data to bytes
#         if isinstance(audio_data, dict) and 'bytes' in audio_data:
#             audio_bytes = audio_data['bytes']
#         else:
#             st.error("Invalid audio data format")
#             return None
            
#         # Upload the audio file
#         upload_response = requests.post(
#             upload_endpoint,
#             headers=upload_headers,
#             data=audio_bytes
#         )
        
#         if upload_response.status_code != 200:
#             st.error(f"Upload failed: {upload_response.text}")
#             return None
            
#         upload_url = upload_response.json()["upload_url"]
        
#         # Start transcription
#         transcript_request = {
#             "audio_url": upload_url,
#             "language_code": "en",  # You can change this for other languages
#         }
        
#         transcript_response = requests.post(
#             transcript_endpoint,
#             json=transcript_request,
#             headers=headers
#         )
        
#         if transcript_response.status_code != 200:
#             st.error(f"Transcription request failed: {transcript_response.text}")
#             return None
            
#         transcript_id = transcript_response.json()['id']
#         polling_endpoint = f"{transcript_endpoint}/{transcript_id}"
        
#         # Poll for results
#         status = "submitted"
#         max_retries = 30  # Max wait time = 30 seconds
#         retry_count = 0
        
#         while status != "completed" and retry_count < max_retries:
#             polling_response = requests.get(polling_endpoint, headers=headers)
#             status = polling_response.json()['status']
            
#             if status == 'completed':
#                 return polling_response.json()['text']
#             elif status == 'error':
#                 st.error(f"Transcription error: {polling_response.json()}")
#                 return None
                
#             retry_count += 1
#             time.sleep(1)
            
#         if retry_count >= max_retries:
#             st.warning("Transcription timed out")
#             return None
            
#     except Exception as e:
#         st.error(f"Error in speech_to_text: {str(e)}")
#         return None

# # Streamlit UI
# st.set_page_config(page_title="Gemini AI Agent", layout="centered")
# st.title("BetterWeb Browser Agent")
# st.markdown("Enter a query or speak it out. Let the AI agent handle the task for you!")

# # Create tabs for different sections
# tab1, tab2 = st.tabs(["Input", "Results"])

# with tab1:
#     # Input form
#     with st.form(key="query_form"):
#         text_col, audio_col = st.columns([4, 1])
        
#         with text_col:
#             query = st.text_input(
#                 "💬 Your Prompt", 
#                 placeholder="e.g. Go to Amazon and buy atta", 
#                 key="query_input",
#                 value=st.session_state.get('transcript', '')
#             )
            
#         with audio_col:
#             st.write("##")  # Vertical alignment
#             audio_bytes = mic_recorder(
#                 key="audio_recorder",
#                 start_prompt="🎤 Speak",
#                 stop_prompt="⏹️ Stop",
#                 use_container_width=True
#             )
        
#         initial_url = st.text_input(
#             "🌍 Initial URL (optional)", 
#             placeholder="https://www.google.com",
#             value="https://www.google.com"
#         )
        
#         headless = st.checkbox("Run Headless Browser", value=False)
#         submit_button = st.form_submit_button(label="Run AI Agent")

#     # Display transcript status
#     transcript_placeholder = st.empty()

#     # Process audio when recorded
#     if audio_bytes and not st.session_state.processing_audio:
#         st.session_state.processing_audio = True
#         with st.spinner("Transcribing your speech..."):
#             transcript = speech_to_text(audio_bytes)
#             if transcript:
#                 st.session_state.transcript = transcript
#                 transcript_placeholder.success(f"Transcribed: {transcript}")
#             else:
#                 transcript_placeholder.warning("Failed to transcribe audio. Please try again or type your query.")
#         st.session_state.processing_audio = False
        
#         # Rerun to update the text input with the transcript
#         st.rerun()

# # Results tab for displaying output
# with tab2:
#     output_container = st.container()
#     with output_container:
#         output_placeholder = st.empty()

# # Run AI agent
# if submit_button and query:
#     with tab2:
#         st.subheader("Processing your request...")
#         progress_bar = st.progress(0)
#         status_text = st.empty()
        
#         async def run_agent():
#             # Update progress
#             progress_bar.progress(10)
#             status_text.text("Initializing AI model...")
            
#             llm = ChatGoogleGenerativeAI(
#                 model="gemini-2.5-flash-preview-04-17",
#                 api_key=GENAI_API_KEY
#             )
            
#             # Update progress
#             progress_bar.progress(30)
#             status_text.text("Starting browser...")
            
#             browser, context = await setup_browser(headless=headless)
            
#             try:
#                 # Update progress
#                 progress_bar.progress(50)
#                 status_text.text("AI agent is working on your task...")
                
#                 result = await agent_loop(llm, context, query, initial_url or "https://www.google.com")
                
#                 # Update progress
#                 progress_bar.progress(90)
#                 status_text.text("Finalizing results...")
                
#                 await browser.close()
                
#                 # Complete progress
#                 progress_bar.progress(100)
#                 status_text.text("Task completed!")
                
#                 return result
#             except Exception as e:
#                 await browser.close()
#                 return f"❌ Error occurred: {str(e)}"

#         try:
#             result = asyncio.run(run_agent())
            
#             # Clear progress indicators
#             progress_bar.empty()
#             status_text.empty()
            
#             # Display result
#             output_placeholder.markdown(f"### 📊 Result:\n```\n{result or 'No result'}\n```")
            
#             # Switch to results tab
#             st.switch_page("tab2")
#         except Exception as e:
#             st.error(f"Error running agent: {str(e)}")

# # Add some helpful information at the bottom
# st.markdown("---")
# st.markdown("""
# **How to use this app:**
# 1. Type your query or click the microphone button to speak
# 2. Optionally specify a starting URL
# 3. Click "Run AI Agent" to execute your task
# """)

# # import streamlit as st
# # import asyncio
# # import os
# # import sys

# # # Ensure backend code is available
# # sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# # from main import setup_browser, agent_loop
# # from langchain_google_genai import ChatGoogleGenerativeAI

# # # Hardcoded API key
# # GENAI_API_KEY = "AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo"

# # # Streamlit configuration
# # st.set_page_config(page_title="Gemini AI Agent", layout="centered")
# # st.title("BetterWeb Browser Agent")
# # st.markdown("Enter a query and let our agent do the task for u easy peasy !")

# # # Input fields
# # with st.form(key="query_form"):
# #     query = st.text_input("💬 Your Prompt", placeholder="e.g. Go to Amazon and buy atta")
# #     initial_url = st.text_input("🌍 Initial URL (optional)", placeholder="https://www.google.com")
# #     headless = st.checkbox("Run Headless Browser", value=False)
# #     submit_button = st.form_submit_button(label="Run Ai  Agent lets go easy-peasy ")

# # # Output placeholder
# # output_placeholder = st.empty()

# # if submit_button and query:
# #     async def run_agent():
# #         llm = ChatGoogleGenerativeAI(
# #             model="gemini-2.5-flash-preview-04-17",
# #             api_key=GENAI_API_KEY
# #         )
# #         browser, context = await setup_browser(headless=headless)
# #         try:
# #             result = await agent_loop(llm, context, query, initial_url or None)
# #             await browser.close()
# #             return result
# #         except Exception as e:
# #             await browser.close()
# #             return f"❌ Error occurred: {e}"

# #     result = asyncio.run(run_agent())
# #     output_placeholder.markdown(f"### 📊 Result:\n```\n{result or 'No result'}\n```")





# # import streamlit as st
# # import asyncio
# # import sys
# # import os

# # # Make sure the directory containing main.py is in the path
# # sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# # from main import setup_browser, agent_loop
# # from langchain_google_genai import ChatGoogleGenerativeAI

# # # === Hardcoded API Key ===
# # GENAI_API_KEY = "AIzaSyBK6b1hH9D55uL1BX5e_QacjBXMI4sSvCs"

# # # Streamlit UI setup
# # st.set_page_config(page_title="Gemini Agent", layout="centered")
# # st.title("🤖 Gemini AI Browser Agent")
# # st.markdown("Enter your prompt and let the AI agent explore the web for you.")

# # # Input fields
# # query = st.text_input("📝 Prompt", placeholder="e.g., Find top 3 AI news websites")
# # initial_url = st.text_input("🔗 Initial URL (optional)", placeholder="https://example.com")

# # # Button to run agent
# # run = st.button("Run Agent")

# # # Placeholder for output
# # output_placeholder = st.empty()

# # # Run agent when button is clicked
# # if run and query:
# #     async def run_agent():
# #         llm = ChatGoogleGenerativeAI(
# #             model="gemini-2.5-flash-preview-04-17",
# #             api_key=GENAI_API_KEY
# #         )
# #         browser, context = await setup_browser(headless=True)
# #         try:
# #             result = await agent_loop(llm, context, query, initial_url or None)
# #             await browser.close()
# #             return result
# #         except Exception as e:
# #             await browser.close()
# #             return f"❌ Error: {e}"

# #     result = asyncio.run(run_agent())
# #     output_placeholder.markdown("### 📊 Result:\n```\n" + (result or "No output.") + "\n```")





# # # import streamlit as st
# # # import asyncio
# # # from main import setup_browser, agent_loop
# # # from langchain_google_genai import ChatGoogleGenerativeAI

# # # # Page config
# # # st.set_page_config(page_title="Gemini Agent", layout="centered")

# # # # Title and description
# # # st.title("🌐 Gemini AI Browser Agent")
# # # st.write("Enter your query and let the agent perform actions in a real browser.")

# # # # Input field
# # # query = st.text_input("Your Prompt", placeholder="Search something...")

# # # # Optional URL
# # # initial_url = st.text_input("Optional Initial URL", placeholder="https://example.com")

# # # # Button to run agent
# # # run = st.button("Run Agent")

# # # # Output box
# # # output_placeholder = st.empty()

# # # # Handle agent execution
# # # if run and query:
# # #     async def run_agent():
# # #         llm = ChatGoogleGenerativeAI(
# # #             model="gemini-2.5-flash-preview-04-17",
# # #             api_key="AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo"  # Replace with env var for safety
# # #         )
# # #         browser, context = await setup_browser(headless=True)
# # #         try:
# # #             result = await agent_loop(llm, context, query, initial_url or None)
# # #             await browser.close()
# # #             return result
# # #         except Exception as e:
# # #             await browser.close()
# # #             return f"❌ Error: {e}"

# # #     result = asyncio.run(run_agent())
# # #     output_placeholder.markdown(f"### 📊 Result:\n```\n{result}\n```")


# # # if __name__ == "__main__":
# # #      main()








import streamlit as st
import asyncio
import os
import sys
from streamlit_mic_recorder import mic_recorder
import requests
import time
import base64
import json

# Ensure the parent directory of main.py is in the system path
# This assumes main.py is in the same directory as frontend.py,
# or in a directory one level up if frontend.py is in a subdirectory.
# Adjust sys.path.append if your file structure is different.
sys.path.append(os.path.dirname(os.path.abspath(__file__))) 
# If main.py is in a 'scripts' folder and frontend.py is in the root, you might need:
# sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scripts'))

# Import your custom modules (setup_browser and agent_loop from main.py)
from main import setup_browser, agent_loop
from langchain_google_genai import ChatGoogleGenerativeAI

# API KEYS
GENAI_API_KEY = "AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo"  # Gemini (Hardcoded as requested)
ASSEMBLY_API_KEY = "5c4816e6d3b34495b46942a122bc07d4"  # AssemblyAI

# Initialize session state for transcript
if 'transcript' not in st.session_state:
    st.session_state.transcript = ""
if 'processing_audio' not in st.session_state:
    st.session_state.processing_audio = False
if 'query_input_value' not in st.session_state:
    st.session_state.query_input_value = ""


# Function to convert speech to text using AssemblyAI
def speech_to_text(audio_data):
    upload_endpoint = "https://api.assemblyai.com/v2/upload"
    transcript_endpoint = "https://api.assemblyai.com/v2/transcript"
    headers = {
        "authorization": ASSEMBLY_API_KEY,
        "content-type": "application/json"
    }
    upload_headers = {
        "authorization": ASSEMBLY_API_KEY
    }
    
    try:
        # Convert audio data to bytes
        if isinstance(audio_data, dict) and 'bytes' in audio_data:
            audio_bytes = audio_data['bytes']
        else:
            st.error("Invalid audio data format for AssemblyAI")
            return None
            
        # Upload the audio file
        upload_response = requests.post(
            upload_endpoint,
            headers=upload_headers,
            data=audio_bytes
        )
        
        if upload_response.status_code != 200:
            st.error(f"AssemblyAI Upload failed: {upload_response.text}")
            return None
            
        upload_url = upload_response.json()["upload_url"]
        
        # Start transcription
        transcript_request = {
            "audio_url": upload_url,
            "language_code": "en",  # You can change this for other languages
        }
        
        transcript_response = requests.post(
            transcript_endpoint,
            json=transcript_request,
            headers=headers
        )
        
        if transcript_response.status_code != 200:
            st.error(f"AssemblyAI Transcription request failed: {transcript_response.text}")
            return None
            
        transcript_id = transcript_response.json()['id']
        polling_endpoint = f"{transcript_endpoint}/{transcript_id}"
        
        # Poll for results
        status = "submitted"
        max_retries = 30  # Max wait time = 30 seconds for polling
        retry_count = 0
        
        while status != "completed" and retry_count < max_retries:
            polling_response = requests.get(polling_endpoint, headers=headers)
            status = polling_response.json()['status']
            
            if status == 'completed':
                return polling_response.json()['text']
            elif status == 'error':
                st.error(f"AssemblyAI Transcription error: {polling_response.json()}")
                return None
                
            retry_count += 1
            time.sleep(1) # Wait 1 second before polling again
            
        if retry_count >= max_retries:
            st.warning("AssemblyAI Transcription timed out.")
            return None
            
    except requests.exceptions.RequestException as req_e:
        st.error(f"Network or API request error with AssemblyAI: {str(req_e)}")
        return None
    except json.JSONDecodeError as json_e:
        st.error(f"Error decoding JSON response from AssemblyAI: {str(json_e)}")
        return None
    except Exception as e:
        st.error(f"An unexpected error occurred in speech_to_text: {str(e)}")
        return None

# Streamlit UI
st.set_page_config(page_title="Gemini AI Agent", layout="centered")
st.title("BetterWeb Browser Agent")
st.markdown("Enter a query or speak it out. Let the AI agent handle the task for you!")

# Create tabs for different sections
tab1, tab2 = st.tabs(["Input", "Results"])

with tab1:
    # Input form
    with st.form(key="query_form"):
        text_col, audio_col = st.columns([4, 1])
        
        with text_col:
            # Use a session state variable for the text input's value
            query = st.text_input(
                "💬 Your Prompt", 
                placeholder="e.g. Go to Amazon and buy atta", 
                key="query_input",
                value=st.session_state.query_input_value # Bind to session state
            )
            
        with audio_col:
            st.write("##")  # Vertical alignment
            audio_bytes = mic_recorder(
                key="audio_recorder",
                start_prompt="🎤 Speak",
                stop_prompt="⏹️ Stop",
                use_container_width=True
            )
        
        initial_url = st.text_input(
            "🌍 Initial URL (optional)", 
            placeholder="https://www.google.com",
            value="https://www.google.com" # Default initial URL
        )
        
        headless = st.checkbox("Run Headless Browser", value=False)
        submit_button = st.form_submit_button(label="Run AI Agent")

    # Display transcript status
    transcript_placeholder = st.empty()

    # Process audio when recorded
    if audio_bytes and not st.session_state.processing_audio:
        st.session_state.processing_audio = True
        with st.spinner("Transcribing your speech..."):
            transcript = speech_to_text(audio_bytes)
            if transcript:
                st.session_state.transcript = transcript
                st.session_state.query_input_value = transcript # Update session state for text input
                transcript_placeholder.success(f"Transcribed: {transcript}")
            else:
                transcript_placeholder.warning("Failed to transcribe audio. Please try again or type your query.")
        st.session_state.processing_audio = False
        
        # Rerun to update the text input with the transcript
        # This is critical for `st.text_input` to reflect the updated `st.session_state.query_input_value`
        st.rerun()

# Results tab for displaying output
with tab2:
    output_container = st.container()
    with output_container:
        output_placeholder = st.empty()

# Run AI agent only if submit button is pressed and query is not empty
if submit_button and query:
    with tab2:
        st.subheader("Processing your request...")
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        async def run_agent():
            browser_session = None # Initialize to None
            try:
                # Update progress
                progress_bar.progress(10)
                status_text.text("Initializing AI model...")
                
                # Corrected model name here!
                llm = ChatGoogleGenerativeAI(
                    model="gemini-2.5-flash", # Use the stable model
                    api_key=GENAI_API_KEY
                )
                
                # Update progress
                progress_bar.progress(30)
                status_text.text("Starting browser...")
                
                browser_session, context = await setup_browser(headless=headless)
                
                # Update progress
                progress_bar.progress(50)
                status_text.text("AI agent is working on your task...")
                
                result = await agent_loop(llm, context, query, initial_url or "https://www.google.com")
                
                # Update progress
                progress_bar.progress(90)
                status_text.text("Finalizing results...")
                
                return result
            except Exception as e:
                st.error(f"Error during agent execution: {str(e)}")
                return f"❌ Agent failed: {str(e)}"
            finally:
                if browser_session:
                    await browser_session.close() # Ensure browser is closed
        
        # Run the async agent function
        result_output = asyncio.run(run_agent())
        
        # Clear progress indicators
        progress_bar.empty()
        status_text.empty()
        
        # Display result
        output_placeholder.markdown(f"### 📊 Result:\n```\n{result_output or 'No result'}\n```")
        
        # Switch to results tab after processing
        # This is done implicitly by the `with tab2:` block or can be done explicitly
        # st.switch_page("tab2") # This is not how tabs work, the `with tab2:` block handles showing it

# Add some helpful information at the bottom
st.markdown("---")
st.markdown("""
**How to use this app:**
1. Type your query or click the microphone button to speak
2. Optionally specify a starting URL
3. Click "Run AI Agent" to execute your task
""")