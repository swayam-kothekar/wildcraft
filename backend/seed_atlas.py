#!/usr/bin/env python3
"""
WildCraft AI — MongoDB Atlas Connection & Seeding Verification Script.
Use this script to verify your MongoDB Atlas cluster connection and seed
the survival knowledge catalog into MongoDB collections.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
load_dotenv()

uri = os.getenv("MONGODB_ATLAS_URI") or os.getenv("MONGODB_URI")

if not uri:
    print("\n❌ Error: Neither MONGODB_URI nor MONGODB_ATLAS_URI is set in backend/.env!")
    print("👉 Add your MongoDB connection string to backend/.env like:")
    print("   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wildcraft?retryWrites=true&w=majority\n")
    sys.exit(1)

print(f"\n🍃 Attempting connection to MongoDB Atlas...")

try:
    from pymongo import MongoClient
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # Ping
    client.admin.command('ping')
    print("✅ Ping successful! Connected to MongoDB Atlas cluster.")

    db = client["wildcraft_db"]
    
    # Check survival_catalog
    col_catalog = db["survival_catalog"]
    existing_count = col_catalog.count_documents({})
    print(f"📦 Collection 'survival_catalog' currently has {existing_count} documents.")

    try:
        from atlas_survival_store import atlas_survival_store
    except ImportError:
        from backend.atlas_survival_store import atlas_survival_store
    catalog_items = atlas_survival_store.catalog

    # Check count again after store initialization
    count_now = col_catalog.count_documents({})
    if count_now == 0 and catalog_items:
        # Strip any existing _id before inserting
        docs_to_insert = [{k: v for k, v in item.items() if k != "_id"} for item in catalog_items]
        col_catalog.insert_many(docs_to_insert)
        print(f"🌱 Successfully seeded {len(docs_to_insert)} survival manual entries into 'survival_catalog'.")
    else:
        print(f"✅ Collection 'survival_catalog' is seeded with {count_now} entries.")

    # Check backcountry_logs
    col_logs = db["backcountry_logs"]
    logs_count = col_logs.count_documents({})
    print(f"📖 Collection 'backcountry_logs' has {logs_count} stored trek logs.")

    print("\n🎉 Your MongoDB Atlas setup is verified and 100% ready for the hackathon!")

except Exception as e:
    print(f"\n❌ Connection failed: {e}")
    print("👉 Check your connection string, IP Access List (allow 0.0.0.0/0 on Atlas), and database user credentials.")
    sys.exit(1)
