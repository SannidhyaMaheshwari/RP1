# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from routes import auth_routes, data_routes,stats_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://172.17.48.18:3000","http://localhost:8000","http://172.17.49.204:3000","http://172.17.49.204:8000", "http://172.17.48.18:3000","http://172.17.48.18:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under appropriate prefixes
app.include_router(auth_routes.router, prefix="/api")
app.include_router(data_routes.router)
app.include_router(stats_routes.router, prefix="/api") 

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
