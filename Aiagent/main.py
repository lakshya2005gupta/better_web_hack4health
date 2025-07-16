


# import os
# import asyncio
# import argparse
# # Removed speech_recognition and pyttsx3 as they are not used in this backend file
# from langchain_google_genai import ChatGoogleGenerativeAI
# from browser_use import Agent, Browser, BrowserContextConfig, BrowserConfig
# # Using BrowserContext directly from browser_use.browser.context for clarity, though it's often handled by Browser.new_context
# from browser_use.browser.context import BrowserContext 
# # from pydantic import SecretStr # Only needed if using SecretStr for API key, which we're hardcoding
# # from dotenv import load_dotenv # Only needed if loading from .env, which we're hardcoding

# async def setup_browser(headless: bool = False):
#     """Initialize and configure the browser"""
#     browser = Browser(
#         config=BrowserConfig(
#             headless=headless,
#         ),
#     )
#     context_config = BrowserContextConfig(
#         wait_for_network_idle_page_load_time=5.0,
#         highlight_elements=True,
#         save_recording_path="./recordings",
#     )
#     # The BrowserSession object itself can be used to create a context
#     # Use await browser.new_context(config=context_config) for a more direct approach
#     # Or, if explicitly using BrowserContext, ensure it's correctly initialized:
#     browser_context = await browser.new_context(config=context_config) # This is the more modern and recommended way
#     return browser, browser_context


# async def agent_loop(llm, browser_context, query, initial_url=None):
#     """Run agent loop with optional initial URL"""
#     # Set up initial actions if URL is provided
#     initial_actions = None
#     if initial_url and initial_url != "https://www.google.com": # Only add action if not default Google URL and actually provided
#         initial_actions = [
#             {"open_tab": {"url": initial_url}},
#         ]

#     agent = Agent(
#         task=query,
#         llm=llm,
#         browser_context=browser_context,
#         use_vision=True,
#         generate_gif=True,
#         initial_actions=initial_actions,
#     )

#     # Start Agent and browser
#     result = await agent.run()

#     return result.final_result() if result else "No results or the task could not be completed."


# async def main():
#     # Load environment variables (commented out as per hardcoded API key request)
#     # load_dotenv()

#     # Disable telemetry
#     os.environ["ANONYMIZED_TELEMETRY"] = "false"

#     # --- Argument Parsing ---
#     parser = argparse.ArgumentParser(
#         description="Run Gemini agent with browser interaction."
#     )
#     parser.add_argument(
#         "--model",
#         type=str,
#         default="gemini-2.5-flash", # Changed to stable model
#         help="The Gemini model to use.",
#     )
#     parser.add_argument(
#         "--headless",
#         action="store_true",
#         help="Run the browser in headless mode.",
#     )
#     parser.add_argument(
#         "--url",
#         type=str,
#         help="Starting URL for the browser to navigate to before user query.",
#     )
#     parser.add_argument(
#         "--query",
#         type=str,
#         help="The query to process.",
#     )
#     args = parser.parse_args()
#     # --- End Argument Parsing ---

#     # Initialize the Gemini model
#     llm = ChatGoogleGenerativeAI(
#         model=args.model,
#         api_key="AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo" # Hardcoded API key
#     )

#     # Setup browser
#     browser_session, browser_context = await setup_browser(headless=args.headless)

#     try:
#         if args.query:
#             result = await agent_loop(llm, browser_context, args.query, initial_url=args.url)
#             print(result)
#         else:
#             # Get search queries from user
#             while True:
#                 try:
#                     user_input = input("\nEnter your prompt (or 'quit' to exit): ")
#                     if user_input.lower() in ["quit", "exit", "q"]:
#                         break

#                     # Process the prompt and run agent loop with initial URL if provided
#                     result = await agent_loop(
#                         llm, browser_context, user_input, initial_url=args.url
#                     )

#                     # Clear URL after first use to avoid reopening same URL in subsequent queries
#                     args.url = None

#                     # Display the final result with clear formatting
#                     print("\n📊 Search Results:")
#                     print("=" * 50)
#                     print(result if result else "No results found")
#                     print("=" * 50)

#                 except KeyboardInterrupt:
#                     print("\nExiting...")
#                     break
#                 except Exception as e:
#                     print(f"\nError occurred during agent loop: {e}")
#     finally:
#         print("Closing browser")
#         # Ensure browser is closed properly even if an error occurs
#         if browser_session:
#             await browser_session.close()


# if __name__ == "__main__":
#     asyncio.run(main())


import os
import asyncio
import argparse
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent, Browser, BrowserContextConfig, BrowserConfig
from browser_use.browser.context import BrowserContext 

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
    browser_context = await browser.new_context(config=context_config) 
    return browser, browser_context


async def agent_loop(llm, browser_context, query, initial_url="https://www.google.com"):
    """Run agent loop with optional initial URL"""
    initial_actions = None
    # CORRECTED: Changed "https://www.google3.com" back to "https://www.google.com"
    if initial_url and initial_url != "https://www.google3.com":
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

    result = await agent.run()

    return result.final_result() if result else "No results or the task could not be completed."


async def main():
    os.environ["ANONYMIZED_TELEMETRY"] = "false"

    parser = argparse.ArgumentParser(
        description="Run Gemini agent with browser interaction."
    )
    parser.add_argument(
        "--model",
        type=str,
        default="gemini-2.5-flash",
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
    args = parser.parse_args()

    llm = ChatGoogleGenerativeAI(
        model=args.model,
        api_key="AIzaSyAXzmHm2OTvvjtUmDyQNy-tgDlslaxbOEo"
    )

    browser_session, browser_context = await setup_browser(headless=args.headless)

    try:
        if args.query:
            result = await agent_loop(llm, browser_context, args.query, initial_url=args.url)
            print(result)
        else:
            while True:
                try:
                    user_input = input("\nEnter your prompt (or 'quit' to exit): ")
                    if user_input.lower() in ["quit", "exit", "q"]:
                        break

                    result = await agent_loop(
                        llm, browser_context, user_input, initial_url=args.url
                    )

                    args.url = None

                    print("\n📊 Search Results:")
                    print("=" * 50)
                    print(result if result else "No results found")
                    print("=" * 50)

                except KeyboardInterrupt:
                    print("\nExiting...")
                    break
                except Exception as e:
                    print(f"\nError occurred during agent loop: {e}")
    finally:
        print("Closing browser")
        if browser_session:
            await browser_session.close()


if __name__ == "__main__":
    asyncio.run(main())