import os
from dotenv import load_dotenv
class Config:
    def __init__(self):
        load_dotenv()
        self.verify_token = os.getenv("META_VERIFY_TOKEN", "my_lans_secure_token_2026")
        self.page_access_token = os.getenv("META_PAGE_ACCESS_TOKEN", "YOUR_PAGE_ACCESS_TOKEN_HERE")
        self.graph_api_version= os.getenv("GRAPH_API_VERSION","v26.0")
