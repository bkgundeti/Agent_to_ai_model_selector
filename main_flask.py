from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from pymongo import MongoClient

import re
import certifi
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
from werkzeug.utils import secure_filename
from agents.chat_agent import model_col

from agents.chat_agent import ChatAgent
from agents.requir_recommender_agent import RecommenderAgent
from agents.pricing_agent import PricingAgent
from agents.report_agent import ReportAgent

# ✅ Load .env variables
load_dotenv()

app = Flask(__name__, static_folder="frontend/dist", static_url_path="")
app.secret_key = "your-secret-key"
app.config["SESSION_TYPE"] = "filesystem"
CORS(app)

# ✅ MongoDB Configuration
mongo_uri = os.getenv("MONGO_URI")
user_db_name = os.getenv("USER_DB_NAME")
users_collection_name = os.getenv("USERS_COLLECTION_NAME")
chats_collection_name = os.getenv("CHATS_COLLECTION_NAME")

mongo_client = MongoClient(
    mongo_uri,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=20000
)
user_db = mongo_client[user_db_name]
users_col = user_db[users_collection_name]
chats_col = user_db[chats_collection_name]
final_model_col = user_db["final_models"]

# ✅ Azure OpenAI Setup
gpt_client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-05-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    default_headers={"azure-openai-deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")}
)
az_key = os.getenv("AZURE_OPENAI_KEY")
az_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
assistant_id = os.getenv("AZURE_OPENAI_ASSISTANT_ID")

# ✅ Signup API
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"status": "fail", "message": "All fields are required"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"status": "fail", "message": "Email already registered"}), 409

    users_col.insert_one({
        "username": name,
        "email": email,
        "password": password
    })

    return jsonify({"status": "success", "message": "User registered successfully"})

# ✅ Login API
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    print("🎯 Login API hit")

    if not email or not password:
        return jsonify({"status": "fail", "message": "Both email and password are required"}), 400

    existing_user = users_col.find_one({"email": email})
    if not existing_user:
        return jsonify({"status": "fail", "message": "User not found. Please sign up."}), 404

    if existing_user["password"] != password:
        return jsonify({"status": "fail", "message": "Incorrect password"}), 401
    
    session[f"chat_session_{existing_user['email']}"] = {
    "shortlisted_models": [],
    "current_model": None,
    "rejected_models": [],
    "original_requirement": "",
    "username": existing_user["email"]
    }
    
    print("✅ Login successful for:", email)

    return jsonify({"status": "success", "email": existing_user["email"]})

# ✅ Chat API
# ✅ Updated Chat API
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    email = data.get("email")
    message = data.get("message")

    chat_agent = ChatAgent(gpt_client)
    
    # Get session data with user-specific key
    session_key = f"chat_session_{email}"
    session_data = session.get(session_key, {
        "email": email,
        "shortlisted_models": [],
        "current_model": None,
        "rejected_models": [],
        "original_requirement": ""
    })

    # Process user input with enhanced context
    chat_response = chat_agent.process_web_input(message, session_data, username=email)

    if not chat_response or not chat_response["proceed"]:
        response = chat_response["message"] if chat_response else "Could not process."
    else:
        action = chat_response.get("action")

        if action == "NewRequirement":
            recommender = RecommenderAgent(gpt_client)
            recommended = recommender.recommend_models(
                analyzed_user_input=message,
                username=email,
                is_new_requirement=1
            )

            pricing_agent = PricingAgent(assistant_id, az_key, az_endpoint)
            pricing_info = pricing_agent.analyze_pricing(recommended)

            session_data["original_requirement"] = message
            print("👀 Saving for email:", email)

            report_agent = ReportAgent(gpt_client)
            report = report_agent.generate_report(email, message, recommended, pricing_info)

            session_data["shortlisted_models"] = recommended
            session_data["current_model"] = recommended[0] if recommended else None
            session_data["rejected_models"] = []

            response = report

        elif action == "FollowUp":
            # The response is already handled in ChatAgent
            response = chat_response["message"]

        elif action == "ModelRejection":
            recommender = RecommenderAgent(gpt_client)
            original_requirement = chat_response.get("requirement", "")
            rejected_models = session_data.get("rejected_models", [])

            recommended = recommender.recommend_models(
                analyzed_user_input=original_requirement,
                username=email,
                is_new_requirement=0
            )

            if not recommended:
                response = "No more suitable models found. Would you like to try a different approach or modify your requirements?"
            else:
                pricing_agent = PricingAgent(assistant_id, az_key, az_endpoint)
                pricing_info = pricing_agent.analyze_pricing(recommended)

                report_agent = ReportAgent(gpt_client)
                report = report_agent.generate_report(email, original_requirement, recommended, pricing_info)

                session_data["shortlisted_models"] = recommended
                session_data["current_model"] = recommended[0] if recommended else None

                response = report

        else:
            response = "I'm here to help with AI model recommendations. Could you please clarify what you need?"

    # Save session data with user-specific key
    session[session_key] = session_data
    print("✅ Stored session for:", email)

    # Store chat in database BEFORE returning response
    chats_col.insert_one({"email": email, "message": message, "response": response})
    
    return jsonify({
        "response": response,
        "current_model": session_data.get("current_model")
    })

# ✅ History API
@app.route("/history/<username>", methods=["GET"])
def history(username):
    chats = chats_col.find({"email": username})
    result = []
    for c in chats:
        result.append({"email": username, "message": c["message"]})
        if "response" in c:
            result.append({"username": "Agent", "message": c["response"]})
    return jsonify(result)

# ✅ Upload API
@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["file"]
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join("uploads", filename)
        os.makedirs("uploads", exist_ok=True)
        file.save(filepath)
        return jsonify({"status": "success", "file": filename})
    return jsonify({"status": "fail"}), 400

# ✅ Clear Chat API
@app.route("/clear_chat", methods=["POST"])
def clear_chat():
    email = request.get_json().get("username")
    chats_col.delete_many({"email": email})
    return jsonify({"status": "cleared"})

# ✅ Serve React Frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")
@app.route("/logout", methods=["POST", "OPTIONS"])

def logout_user():
    try:
        # Handle both standard JSON and navigator.sendBeacon (text/plain)
        if request.is_json:
            data = request.get_json()
        else:
            import json
            data = json.loads(request.data.decode("utf-8"))

        email = data.get("email")
        print(f"🔐 Logout request received for: {email}")

        deleted_chats = chats_col.delete_many({"email": email})
        deleted_models = final_model_col.delete_many({"email": email})

        print(f"🧹 Deleted {deleted_chats.deleted_count} chats.")
        print(f"🧹 Deleted {deleted_models.deleted_count} final models.")

        return jsonify({
            "status": "success",
            "message": f"Data cleared for {email}"
        }), 200

    except Exception as e:
        print("❌ Error during logout:", str(e))
        return jsonify({"status": "fail", "message": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
