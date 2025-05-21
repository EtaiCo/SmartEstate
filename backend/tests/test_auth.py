import pytest
from fastapi.testclient import TestClient
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import sys
import os
from datetime import date


# Add the parent directory to path so we can import the main app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app
from database import Base
from models import Users
import models

# Create test database
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

from main import get_db
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Add test data
    db = TestingSessionLocal()
    test_user = Users(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        password="password123",
        is_admin=False
    )
    admin_user = Users(
        email="admin@example.com",
        first_name="Admin",
        last_name="User",
        password="admin123",
        is_admin=True
    )
    db.add(test_user)
    db.add(admin_user)
    db.commit()
    
    yield  # Run the test
    
    # Clean up / tear down
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


class TestUserAuthentication:
    def test_create_user_success(self, client, test_db):
        """Test successful user creation."""
        new_user = {
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "newpass123",
            "is_admin": False
        }
        
        response = client.post("/users/", json=new_user)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == new_user["email"]
        assert data["first_name"] == new_user["first_name"]
        assert data["last_name"] == new_user["last_name"]
        assert "password" not in data  # Password should not be returned
    
    def test_create_user_duplicate_email(self, client, test_db):
        """Test user creation with an email that already exists."""
        duplicate_user = {
            "email": "test@example.com",  # This email already exists
            "first_name": "Another",
            "last_name": "User",
            "password": "anotherpass",
            "is_admin": False
        }
        
        response = client.post("/users/", json=duplicate_user)
        assert response.status_code == 400
        assert "Email already used!" in response.json()["detail"]
    
    def test_login_success(self, client, test_db):
        """Test successful login."""
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        
        response = client.post("/login/", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == login_data["email"]
        assert data["user"]["first_name"] == "Test"
        assert data["user"]["last_name"] == "User"
        assert data["is_admin"] == False
        assert "Welcome" in data["message"]
    
    def test_login_admin(self, client, test_db):
        """Test admin login."""
        login_data = {
            "email": "admin@example.com",
            "password": "admin123"
        }
        
        response = client.post("/login/", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == login_data["email"]
        assert data["is_admin"] == True
    
    def test_login_invalid_credentials(self, client, test_db):
        """Test login with invalid credentials."""
        # Wrong password
        login_data = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/login/", json=login_data)
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]
        
        # Non-existent user
        login_data = {
            "email": "nonexistent@example.com",
            "password": "anypassword"
        }
        
        response = client.post("/login/", json=login_data)
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]
    
    def test_logout(self, client, test_db):
        """Test logout functionality."""
        # First login to create a session
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        client.post("/login/", json=login_data)
        
        # Now try to logout
        response = client.post("/logout/")
        assert response.status_code == 200
        assert response.json()["message"] == "Logged out successfully"
        
        # Try to access dashboard after logout
        response = client.get("/dashboard/")
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
    
    def test_dashboard_authenticated(self, client, test_db):
        """Test accessing dashboard when authenticated."""
        # First login to create a session
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        client.post("/login/", json=login_data)
        
        # Now try to access dashboard
        response = client.get("/dashboard/")
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == login_data["email"]
        assert data["user"]["first_name"] == "Test"
        assert "Hello" in data["message"]
    
    def test_dashboard_not_authenticated(self, client, test_db):
        """Test accessing dashboard when not authenticated."""
        response = client.get("/dashboard/")
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
    
    def test_change_password_success(self, client, test_db):
        """Test successful password change."""
        change_password_data = {
            "email": "test@example.com",
            "current_password": "password123",
            "new_password": "newpassword123"
        }
        
        response = client.post("/change-password/", json=change_password_data)
        assert response.status_code == 200
        assert response.json()["message"] == "Password changed successfully"
        
        # Try to login with new password
        login_data = {
            "email": "test@example.com",
            "password": "newpassword123"
        }
        
        response = client.post("/login/", json=login_data)
        assert response.status_code == 200
    
    def test_change_password_wrong_current(self, client, test_db):
        """Test password change with incorrect current password."""
        change_password_data = {
            "email": "test@example.com",
            "current_password": "wrongpassword",
            "new_password": "newpassword123"
        }
        
        response = client.post("/change-password/", json=change_password_data)
        assert response.status_code == 400
        assert "Current password is incorrect" in response.json()["detail"]
    
    def test_change_password_user_not_found(self, client, test_db):
        """Test password change for non-existent user."""
        change_password_data = {
            "email": "nonexistent@example.com",
            "current_password": "password123",
            "new_password": "newpassword123"
        }
        
        response = client.post("/change-password/", json=change_password_data)
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]
    
    def test_update_profile_success(self, client, test_db):
        """Test successful profile update."""
        update_data = {
            "email": "test@example.com",
            "first_name": "Updated",
            "last_name": "Name"
        }
        
        response = client.put("/update-profile/", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == update_data["first_name"]
        assert data["last_name"] == update_data["last_name"]
        assert data["email"] == update_data["email"]


    def test_update_profile_user_not_found(self, client, test_db):
        update_data = {
            "email": "nonexistent@example.com",
            "first_name": "Ghost",
            "last_name": "User"
        }
        response = client.put("/update-profile/", json=update_data)
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]

    def test_create_ad_success(self, client, test_db):
        # Simulate login by creating session manually
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        
        response = client.post("/login/", json=login_data)
        print("Login response:", response.cookies)
        ad_data = {
            "ad_type": "Rent",
            "property_type": "Apartment",
            "address": "123 Test St",
            "latitude": 32.0853,
            "longitude": 34.7818,
            "rooms": 3,
            "size": 100,
            "price": 5000,
            "floor": 2,
            "has_elevator": True,
            "has_parking": True,
            "description": "Nice apartment for rent.",
            "publisher_name": "Test Publisher",
            "contact_phone": "0501234567",
            "has_garden": False,
            "has_balcony": True,
            "pets_allowed": True,
            "accessibility": True,
            "publish_date": str(date.today())
        }

        response = client.post("/ads/", json=ad_data)
        assert response.status_code == 200
        data = response.json()
        assert data["address"] == ad_data["address"]
        assert data["price"] == ad_data["price"]

    def test_create_ad_not_authenticated(self, client, test_db):
        ad_data = {
            "ad_type": "Rent",
            "property_type": "Apartment",
            "address": "123 Test St",
            "latitude": 32.0853,
            "longitude": 34.7818,
            "rooms": 3,
            "size": 100,
            "price": 5000,
            "floor": 2,
            "has_elevator": True,
            "has_parking": True,
            "description": "Nice apartment for rent.",
            "publisher_name": "Test Publisher",
            "contact_phone": "0501234567",
            "has_garden": False,
            "has_balcony": True,
            "pets_allowed": True,
            "accessibility": True,
            "publish_date": str(date.today())
        }

        response = client.post("/ads/", json=ad_data)
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
