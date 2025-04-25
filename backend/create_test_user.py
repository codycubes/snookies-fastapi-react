from database import SessionLocal
from services.user import create_user
from schemas.user import UserCreate

def create_test_users():
    db = SessionLocal()
    try:
        # Create test user 1
        user1 = UserCreate(
            username="player1",
            email="player1@example.com",
            password="password123"
        )
        create_user(db, user1)
        print("Created test user 1")

        # Create test user 2
        user2 = UserCreate(
            username="player2",
            email="player2@example.com",
            password="password123"
        )
        create_user(db, user2)
        print("Created test user 2")

    except Exception as e:
        print(f"Error creating test users: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users() 