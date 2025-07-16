

import os
import asyncio
import argparse
import speech_recognition as sr
import pyttsx3
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent, Browser, BrowserContextConfig, BrowserConfig
from browser_use.browser.context import BrowserContext
from pydantic import SecretStr
from dotenv import load_dotenv


async def setup_browser(headless: bool = False):
    """Initialize and configure the browser"""
    browser = Browser(
        config=BrowserConfig(
            headless=headless,
        ),
    )
    context_config = BrowserContextConfig(
        wait_for_network_idle_page_load_time=5.0,
        highlight_elements=True,
        save_recording_path="./recordings",
    )
    return browser, BrowserContext(browser=browser, config=context_config)


async def agent_loop(llm, browser_context, query, initial_url=None):
    """Run agent loop with optional initial URL"""
    # Set up initial actions if URL is provided
    initial_actions = None
    if initial_url:
        initial_actions = [
            {"open_tab": {"url": initial_url}},
        ]

    agent = Agent(
        task=query,
        llm=llm,
        browser_context=browser_context,
        use_vision=True,
        generate_gif=True,
        initial_actions=initial_actions,
    )

    # Start Agent and browser
    result = await agent.run()

    return result.final_result() if result else None


def recognize_speech():
    """Capture speech from microphone and convert to text"""
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    with mic as source:
        print("Listening... Please speak now.")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
    try:
        text = recognizer.recognize_google(audio)
        print(f"Recognized speech: {text}")
        return text
    except sr.UnknownValueError:
        print("Sorry, could not understand the audio.")
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")
    return None


def speak_text(text):
    """Convert text to speech and play it"""
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()


async def main():
    # Load environment variables
    load_dotenv()

    # Disable telemetry
    os.environ["ANONYMIZED_TELEMETRY"] = "false"

    # --- Argument Parsing ---
    parser = argparse.ArgumentParser(
        description="Run Gemini agent with browser interaction."
    )
    parser.add_argument(
        "--model",
        type=str,
        default="gemini-2.5-flash-preview-04-17",
        help="The Gemini model to use.",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run the browser in headless mode.",
    )
    parser.add_argument(
        "--url",
        type=str,
        help="Starting URL for the browser to navigate to before user query.",
    )
    parser.add_argument(
        "--query",
        type=str,
        help="The query to process.",
    )
    parser.add_argument(
        "--speech",
        action="store_true",
        help="Enable speech recognition input mode.",
    )
    args = parser.parse_args()
    # --- End Argument Parsing ---

    # Initialize the Gemini model
    llm = ChatGoogleGenerativeAI(
        model=args.model,
        #api_key=SecretStr(os.getenv("GEMINI_API_KEY")),
        api_key="AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo"
    )

    # Setup browser
    browser, context = await setup_browser(headless=args.headless)

    if args.query:
        result = await agent_loop(llm, context, args.query, initial_url=args.url)
        print(result)
        return
    else:
        # Get search queries from user
        while True:
            try:
                if args.speech:
                    user_input = recognize_speech()
                    if user_input is None:
                        print("Falling back to text input.")
                        user_input = input("\nEnter your prompt (or 'quit' to exit): ")
                else:
                    user_input = input("\nEnter your prompt (or 'quit' to exit): ")

                if user_input.lower() in ["quit", "exit", "q"]:
                    break

                # Process the prompt and run agent loop with initial URL if provided
                result = await agent_loop(
                    llm, context, user_input, initial_url=args.url
                )

                # Clear URL after first use to avoid reopening same URL in subsequent queries
                args.url = None

                # Display the final result with clear formatting
                print("\n📊 Search Results:")
                print("=" * 50)
                print(result if result else "No results found")
                print("=" * 50)
                if args.speech:
                    speak_text(result if result else "No results found")

            except KeyboardInterrupt:
                print("\nExiting...")
                break
            except Exception as e:
                print(f"\nError occurred: {e}")

    print("Closing browser")
    # Ensure browser is closed properly
    await browser.close()


if __name__ == "__main__":
    asyncio.run(main())



import os
import asyncio
import argparse
import speech_recognition as sr
import pyttsx3
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent, Browser, BrowserContextConfig, BrowserConfig
from pydantic import SecretStr

async def setup_browser(headless: bool = False):
    """Initialize and configure the browser"""
    browser_session = Browser(
        config=BrowserConfig(
            headless=headless,
        ),
    )
    context_config = BrowserContextConfig(
        wait_for_network_idle_page_load_time=5.0,
        highlight_elements=True,
        save_recording_path="./recordings",
    )
    # The BrowserSession object itself can be used to create a context
    browser_context = await browser_session.new_context(config=context_config)
    return browser_session, browser_context


async def agent_loop(llm, browser_context, query, initial_url=None):
    """Run agent loop with optional initial URL"""
    # Set up initial actions if URL is provided
    initial_actions = None
    if initial_url:
        initial_actions = [
            {"open_tab": {"url": initial_url}},
        ]

    agent = Agent(
        task=query,
        llm=llm,
        browser_context=browser_context,
        use_vision=True,
        generate_gif=True,
        initial_actions=initial_actions,
    )

    # Start Agent and browser
    result = await agent.run()

    return result.final_result() if result else None


def recognize_speech():
    """Capture speech from microphone and convert to text"""
    recognizer = sr.Recognizer()
    mic = sr.Microphone()
    with mic as source:
        print("Listening... Please speak now.")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
    try:
        text = recognizer.recognize_google(audio)
        print(f"Recognized speech: {text}")
        return text
    except sr.UnknownValueError:
        print("Sorry, could not understand the audio.")
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")
    return None


def speak_text(text):
    """Convert text to speech and play it"""
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()


async def main():
    # Disable telemetry
    os.environ["ANONYMIZED_TELEMETRY"] = "false"

    # --- Argument Parsing ---
    parser = argparse.ArgumentParser(
        description="Run Gemini agent with browser interaction."
    )
    parser.add_argument(
        "--model",
        type=str,
        default="gemini-2.5-flash-preview-04-17",
        help="The Gemini model to use.",
    )
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run the browser in headless mode.",
    )
    parser.add_argument(
        "--url",
        type=str,
        help="Starting URL for the browser to navigate to before user query.",
    )
    parser.add_argument(
        "--query",
        type=str,
        help="The query to process.",
    )
    parser.add_argument(
        "--speech",
        action="store_true",
        help="Enable speech recognition input mode.",
    )
    args = parser.parse_args()
    # --- End Argument Parsing ---

    # Initialize the Gemini model
    llm = ChatGoogleGenerativeAI(
        model=args.model,
        api_key="AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo" # Hardcoded API key
    )

    # Setup browser
    browser_session, browser_context = await setup_browser(headless=args.headless)

    if args.query:
        result = await agent_loop(llm, browser_context, args.query, initial_url=args.url)
        print(result)
    else:
        # Get search queries from user
        while True:
            try:
                if args.speech:
                    user_input = recognize_speech()
                    if user_input is None:
                        print("Falling back to text input.")
                        user_input = input("\nEnter your prompt (or 'quit' to exit): ")
                else:
                    user_input = input("\nEnter your prompt (or 'quit' to exit): ")

                if user_input.lower() in ["quit", "exit", "q"]:
                    break

                # Process the prompt and run agent loop with initial URL if provided
                result = await agent_loop(
                    llm, browser_context, user_input, initial_url=args.url
                )

                # Clear URL after first use to avoid reopening same URL in subsequent queries
                args.url = None

                # Display the final result with clear formatting
                print("\n📊 Search Results:")
                print("=" * 50)
                print(result if result else "No results found")
                print("=" * 50)
                if args.speech:
                    speak_text(result if result else "No results found")

            except KeyboardInterrupt:
                print("\nExiting...")
                break
            except Exception as e:
                print(f"\nError occurred: {e}")

    print("Closing browser")
    # Ensure browser is closed properly
    await browser_session.close()


if __name__ == "__main__":
    asyncio.run(main())
