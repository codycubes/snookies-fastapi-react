from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, tournament, users
from database import engine, Base

# Drop and recreate all tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tournament Management System")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(tournament.router, prefix="/api/tournaments", tags=["tournaments"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Tournament Management System"} 