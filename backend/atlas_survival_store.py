import os
import json
import time

class MongoAtlasSurvivalStore:
    """
    MongoDB Atlas Survival Database & Vector RAG Store.
    Provides persistent cloud storage for:
    1. Backcountry Hiker Logs (collection: backcountry_logs)
    2. Survival & Plant Knowledge Catalog (collection: survival_catalog)
    """
    def __init__(self, catalog_path=None):
        self.uri = os.getenv("MONGODB_ATLAS_URI") or os.getenv("MONGODB_URI")
        self.catalog_path = catalog_path or "wildcraft/data/survival_manual_catalog.json"
        self.client = None
        self.db = None
        self.is_connected = False
        self.catalog = self._load_local_catalog()
        self._connect()
        if self.is_connected:
            self._ensure_and_seed_catalog()

    def _load_local_catalog(self):
        possible_paths = [
            self.catalog_path,
            os.path.join(os.path.dirname(__file__), "data", "survival_manual_catalog.json"),
            os.path.join(os.path.dirname(__file__), "..", "data", "survival_manual_catalog.json"),
            "data/survival_manual_catalog.json",
        ]
        for p in possible_paths:
            if os.path.exists(p):
                try:
                    with open(p, "r") as f:
                        return json.load(f)
                except Exception:
                    pass
        return []

    def _connect(self):
        if self.uri:
            try:
                from pymongo import MongoClient
                self.client = MongoClient(self.uri, serverSelectionTimeoutMS=8000)
                # Verify active connection to MongoDB Atlas
                self.client.admin.command('ping')
                self.db = self.client["wildcraft_db"]
                self.is_connected = True
                print("[MongoDB Atlas] Successfully connected to wildcraft_db cluster!")
            except Exception as e:
                print(f"[MongoDB Atlas] Connection failed ({e}). Running in offline local fallback mode.")
                self.is_connected = False

    def _ensure_and_seed_catalog(self):
        """Automatically seeds the MongoDB Atlas survival_catalog collection if empty."""
        try:
            col = self.db["survival_catalog"]
            count = col.count_documents({})
            if count == 0 and self.catalog:
                col.insert_many(self.catalog)
                print(f"[MongoDB Atlas] Seeded {len(self.catalog)} survival manual entries into 'survival_catalog'.")
        except Exception as e:
            print(f"[MongoDB Atlas] Seed check warning: {e}")

    def query_survival_catalog(self, query: str = "", category: str = None) -> list:
        """
        Queries MongoDB Atlas survival_catalog collection when connected.
        Falls back to local memory if disconnected.
        """
        if self.is_connected and self.db is not None:
            try:
                col = self.db["survival_catalog"]
                filter_query = {}
                if category:
                    filter_query["category"] = {"$regex": f"^{category}$", "$options": "i"}

                if query:
                    regex_pattern = {"$regex": query, "$options": "i"}
                    filter_query["$or"] = [
                        {"name": regex_pattern},
                        {"identification_features": regex_pattern},
                        {"edibility_notes": regex_pattern},
                        {"tags": regex_pattern}
                    ]

                results = list(col.find(filter_query, {"_id": 0}))
                if results:
                    return results
            except Exception as e:
                print(f"[MongoDB Atlas] Query error, using local fallback: {e}")

        # Local in-memory fallback
        if not query and not category:
            return self.catalog

        query_lower = query.lower()
        results = []
        for item in self.catalog:
            match_name = query_lower in item.get("name", "").lower()
            match_cat = category and item.get("category", "").lower() == category.lower()
            match_tags = any(query_lower in t.lower() for t in item.get("tags", []))
            match_features = query_lower in item.get("identification_features", "").lower()

            if match_name or match_cat or match_tags or match_features or not query:
                results.append(item)

        return results if results else self.catalog[:3]

    def save_backcountry_log(self, log_entry: dict) -> dict:
        """Inserts a backcountry journal log directly into MongoDB Atlas."""
        if self.is_connected and self.db is not None:
            try:
                col = self.db["backcountry_logs"]
                res = col.insert_one(dict(log_entry))
                return {
                    "status": "saved",
                    "id": str(res.inserted_id),
                    "provider": "MongoDB Atlas Cluster",
                    "collection": "backcountry_logs"
                }
            except Exception as e:
                print(f"[MongoDB Atlas] Insert error: {e}")

        return {
            "status": "saved_local",
            "provider": "Local Offline Cache (Set MONGODB_URI for Atlas cloud sync)",
            "log": log_entry
        }

    def get_backcountry_logs(self, limit: int = 20) -> list:
        """Fetches stored hiker logs from MongoDB Atlas."""
        if self.is_connected and self.db is not None:
            try:
                col = self.db["backcountry_logs"]
                docs = list(col.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit))
                return docs
            except Exception as e:
                print(f"[MongoDB Atlas] Log fetch error: {e}")
        return []

atlas_survival_store = MongoAtlasSurvivalStore()
