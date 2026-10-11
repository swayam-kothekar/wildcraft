import os
import sys

# Ensure root folder is in python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Create package alias so both 'wildcraft.backend' and 'backend' import correctly
try:
    import wildcraft
except ImportError:
    import backend
    sys.modules["wildcraft"] = sys.modules[__name__]
    sys.modules["wildcraft.backend"] = backend

from backend.app import app
