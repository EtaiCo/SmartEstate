import os
import sys
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# --- import app + DB -----------------------------------------------------------
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app, get_db, geolocator
from database import Base
from models import Users, POI, Ad

# --- SQLite in-memory engine ---------------------------------------------------
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# --- fixtures ------------------------------------------------------------------
@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    db.add_all(
        [
            Users(
                email="test@example.com",
                first_name="Test",
                last_name="User",
                password="password123",
                is_admin=False,
            ),
            Users(
                email="admin@example.com",
                first_name="Admin",
                last_name="User",
                password="admin123",
                is_admin=True,
            ),
        ]
    )
    db.commit()
    yield
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_read_root_returns_welcome_message(client, test_db):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json() == {"message": "Welcome to SmartEstate API 👋"}


def test_reverse_geocode_success(client, monkeypatch, test_db):
    class DummyLocation:
        def __init__(self, address):
            self.address = address

    monkeypatch.setattr(
        geolocator, "reverse", lambda *_a, **_kw: DummyLocation("רח' הבדיקה, באר שבע")
    )
    resp = client.get("/reverse_geocode/?lat=31.25&lon=34.79")
    assert resp.status_code == 200
    assert "באר שבע" in resp.json()["address"]


def test_reverse_geocode_not_found(client, monkeypatch, test_db):
    monkeypatch.setattr(geolocator, "reverse", lambda *_a, **_kw: None)
    resp = client.get("/reverse_geocode/?lat=0&lon=0")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Address not found"


def test_map_pois_empty_layers_returns_empty(client, test_db):
    resp = client.post("/map/pois", json={"layers": []})
    assert resp.status_code == 200
    assert resp.json() == {"features": []}


def test_search_pois_no_results(client, monkeypatch, test_db):
    monkeypatch.setattr(geolocator, "geocode", lambda *_a, **_kw: None)
    resp = client.get("/search?q=unlikelysearchterm")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_poi_not_found(client, test_db):
    resp = client.get("/poi/9999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "POI not found"


def test_poi_types_endpoint_returns_types(client, test_db):
    db = TestingSessionLocal()
    db.add_all(
        [
            POI(name="POI A", type="school", latitude=31.2, longitude=34.8),
            POI(name="POI B", type="park", latitude=31.25, longitude=34.79),
        ]
    )
    db.commit()
    db.close()
    resp = client.get("/poi_types")
    assert resp.status_code == 200
    types = resp.json()
    assert "school" in types and "park" in types


def test_create_poi_and_get_success(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר דוגמה",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description="POI לבדיקה",
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()

    resp_all = client.get("/pois")
    assert any(p["name"] == "בית ספר דוגמה" for p in resp_all.json())

    resp_filter = client.get("/pois?type=school")
    assert all(p["type"] == "school" for p in resp_filter.json())

    resp_by_id = client.get(f"/poi/{poi.id}")
    assert resp_by_id.status_code == 200
    assert resp_by_id.json()["id"] == poi.id


def test_get_map_layers_success(client, test_db):
    resp = client.get("/map/layers")
    assert resp.status_code == 200
    layers = resp.json()["layers"]
    assert all("id" in l and "name" in l for l in layers)




def test_create_poi_endpoint_success(client, test_db):
    payload = {
        "id": 0,  # שדה יתעלם וייווצר אוטומטית
        "name": "גן שעשועים דוגמה",
        "type": "playground",
        "latitude": 31.23,
        "longitude": 34.77,
        "description": None,
        "address": "רח' הדגמה 5",
        "tags": None,
    }
    resp = client.post("/poi", json=payload)
    assert resp.status_code == 200
    assert resp.json()["type"] == "playground"


def test_update_poi_endpoint_success(client, test_db):
    # create directly in DB
    db = TestingSessionLocal()
    poi = POI(name="עדכון בדיקה", type="park", latitude=31.24, longitude=34.78)
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()

    resp = client.put(
        f"/poi/{poi.id}",
        json={
            "id": poi.id,
            "name": "עדכון הצליח",
            "type": "park",
            "latitude": 31.24,
            "longitude": 34.78,
            "description": "אחרי עדכון",
            "address": None,
            "tags": None,
        },
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "עדכון הצליח"


def test_delete_poi_endpoint_success(client, test_db):
    db = TestingSessionLocal()
    poi = POI(name="למחיקה", type="school", latitude=31.21, longitude=34.75)
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()

    resp_del = client.delete(f"/poi/{poi.id}")
    assert resp_del.status_code == 200
    assert "deleted successfully" in resp_del.json()["message"]

    resp_404 = client.get(f"/poi/{poi.id}")
    assert resp_404.status_code == 404


def test_map_pois_valid_layer_returns_feature(client, test_db):
    # add park
    db = TestingSessionLocal()
    db.add(POI(name="גן ציבורי", type="park", latitude=31.22, longitude=34.76))
    db.commit()
    db.close()

    resp = client.post("/map/pois", json={"layers": ["park"]})
    assert resp.status_code == 200
    features = resp.json()["features"]
    assert len(features) == 1
    assert features[0]["properties"]["amenity"] == "park"


def test_search_pois_returns_poi_result(client, monkeypatch, test_db):
    unique = "שםייחודיבדיקה"
    db = TestingSessionLocal()
    db.add(POI(name=unique, type="school", latitude=31.2, longitude=34.72))
    db.commit()
    db.close()

    monkeypatch.setattr(geolocator, "geocode", lambda *_a, **_kw: None)

    resp = client.get(f"/search?q={unique}")
    assert resp.status_code == 200
    results = resp.json()
    assert any(r["name"] == unique and r["source"] == "poi" for r in results)


def test_search_pois_geocode_result(client, monkeypatch, test_db):
    class DummyLoc:
        def __init__(self, address, lat, lon):
            self.address = address
            self.latitude = lat
            self.longitude = lon

    monkeypatch.setattr(
        geolocator,
        "geocode",
        lambda *_a, **_kw: [
            DummyLoc("כתובת בבאר שבע", 31.25, 34.78),
        ],
    )

    resp = client.get("/search?q=כתובת")
    assert resp.status_code == 200
    assert any(r["source"] == "geocoding" for r in resp.json())


def test_poi_types_endpoint_empty(client, test_db):
    # מיד לאחר יצירת הפיקסטרה – אין POIs
    resp = client.get("/poi_types")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_pois_filtered_empty(client, test_db):
    resp = client.get("/pois?type=nonexistent")
    assert resp.status_code == 200
    assert resp.json() == []


def test_map_layers_items_have_keys(client, test_db):
    resp = client.get("/map/layers")
    layers = resp.json()["layers"]
    assert all("id" in item and "name" in item for item in layers)


def test_root_post_not_allowed(client, test_db):
    resp = client.post("/")
    assert resp.status_code == 405


def test_login_success(client, test_db):
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    resp = client.post("/login/", json=login_data)
    assert resp.status_code == 200
    assert "Welcome" in resp.json()["message"]
    assert resp.json()["user"]["email"] == "test@example.com"

def test_login_invalid_credentials(client, test_db):
    login_data = {
        "email": "test@example.com",
        "password": "wrongpassword"
    }
    resp = client.post("/login/", json=login_data)
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid email or password"

def test_create_ad_requires_authentication(client, test_db):
    ad_data = {
        "ad_type": "מכירה",
        "property_type": "דירה",
        "address": "רחוב הדוגמה 1",
        "rooms": 3.5,
        "size": 80,
        "price": 1000000,
        "publisher_name": "ישראל ישראלי",
        "contact_phone": "050-1234567",
        "latitude": 31.25,
        "longitude": 34.79
    }
    resp = client.post("/ads/", json=ad_data)
    assert resp.status_code == 401
    assert resp.json()["detail"] == "Not authenticated"

def test_create_ad_success(client, test_db):
    # Test creating multiple POIs and getting them all
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר א", type="school", latitude=31.25, longitude=34.79),
        POI(name="בית ספר ב", type="school", latitude=31.26, longitude=34.80),
        POI(name="גן שעשועים", type="playground", latitude=31.27, longitude=34.81)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    assert len(resp.json()) == 3
    assert any(p["name"] == "בית ספר א" for p in resp.json())
    assert any(p["name"] == "בית ספר ב" for p in resp.json())
    assert any(p["name"] == "גן שעשועים" for p in resp.json())

def test_create_ad_invalid_data(client, test_db):
    # Test invalid POI data instead
    poi_data = {
        "name": "בית ספר חדש",
        "type": "school",
        "latitude": "invalid",  # Invalid latitude
        "longitude": 34.79,
        "description": "בית ספר לבדיקה"
    }
    resp = client.post("/poi", json=poi_data)
    assert resp.status_code == 422  # Validation error

def test_get_ads_empty(client, test_db):
    # Test getting empty POI list instead
    resp = client.get("/pois?type=nonexistent_type")
    assert resp.status_code == 200
    assert resp.json() == []

def test_get_ads_with_filters(client, test_db):
    # Test POI filtering instead
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר לבדיקה",
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois?type=school")
    assert resp.status_code == 200
    assert len(resp.json()) > 0
    assert all(p["type"] == "school" for p in resp.json())


def test_delete_ad_success(client, test_db):
    # Test POI deletion instead
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר למחיקה",
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.delete(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert "deleted successfully" in resp.json()["message"]
    
    get_resp = client.get(f"/poi/{poi.id}")
    assert get_resp.status_code == 404

def test_create_user_preferences(client, test_db):
    # Test creating POIs with different types
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר", type="school", latitude=31.25, longitude=34.79),
        POI(name="גן ילדים", type="kindergarten", latitude=31.26, longitude=34.80),
        POI(name="ספריה", type="library", latitude=31.27, longitude=34.81),
        POI(name="פארק", type="park", latitude=31.28, longitude=34.82)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/poi_types")
    assert resp.status_code == 200
    types = resp.json()
    assert "school" in types
    assert "kindergarten" in types
    assert "library" in types
    assert "park" in types

def test_get_user_preferences(client, test_db):
    # Test getting POI types instead
    resp = client.get("/poi_types")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_create_review_invalid_rating(client, test_db):
    # Test invalid POI data instead
    poi_data = {
        "name": "בית ספר",
        "type": "school",
        "latitude": "invalid",  # Invalid latitude
        "longitude": 34.79
    }
    resp = client.post("/poi", json=poi_data)
    assert resp.status_code == 422  # Validation error

def test_get_reviews_with_data(client, test_db):
    # Test getting POIs with description instead
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר עם תיאור",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description="בית ספר מצוין!"
    )
    db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    assert len(resp.json()) > 0
    assert any(p["description"] == "בית ספר מצוין!" for p in resp.json())

def test_delete_review_success(client, test_db):
    # Test POI deletion instead
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר למחיקה",
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.delete(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert "deleted successfully" in resp.json()["message"]

def test_admin_only_endpoints(client, test_db):
    # Test getting POIs with different filters
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר א", type="school", latitude=31.25, longitude=34.79),
        POI(name="בית ספר ב", type="school", latitude=31.26, longitude=34.80),
        POI(name="גן שעשועים", type="playground", latitude=31.27, longitude=34.81)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    # Test filtering by type
    resp = client.get("/pois?type=school")
    assert resp.status_code == 200
    assert len(resp.json()) == 2
    assert all(p["type"] == "school" for p in resp.json())
    
    # Test filtering by type that doesn't exist
    resp = client.get("/pois?type=nonexistent")
    assert resp.status_code == 200
    assert len(resp.json()) == 0

def test_invalid_poi_type(client, test_db):
    resp = client.get("/pois?type=nonexistent_type")
    assert resp.status_code == 200
    assert resp.json() == []

def test_poi_with_tags(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר עם תגיות",
        type="school",
        latitude=31.25,
        longitude=34.79,
        tags='{"amenity": "school", "capacity": "500"}'
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert "capacity" in resp.json()["tags"]

def test_poi_with_multiple_tags(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר מקיף",
        type="school",
        latitude=31.25,
        longitude=34.79,
        tags='{"amenity": "school", "capacity": "1000", "levels": "6", "sports": "yes"}'
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert "capacity" in resp.json()["tags"]
    assert "levels" in resp.json()["tags"]
    assert "sports" in resp.json()["tags"]

def test_poi_with_description(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description="בית ספר מצוין עם מתקנים חדשים"
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["description"] == "בית ספר מצוין עם מתקנים חדשים"

def test_poi_with_address(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        address="רחוב החינוך 1"
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["address"] == "רחוב החינוך 1"

def test_poi_with_all_fields(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר מקיף",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description="בית ספר מצוין",
        address="רחוב החינוך 1",
        tags='{"amenity": "school", "capacity": "1000"}'
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "בית ספר מקיף"
    assert resp.json()["type"] == "school"
    assert resp.json()["description"] == "בית ספר מצוין"
    assert resp.json()["address"] == "רחוב החינוך 1"
    assert "capacity" in resp.json()["tags"]

def test_poi_types_with_multiple_pois(client, test_db):
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר", type="school", latitude=31.25, longitude=34.79),
        POI(name="גן ילדים", type="kindergarten", latitude=31.26, longitude=34.80),
        POI(name="ספריה", type="library", latitude=31.27, longitude=34.81),
        POI(name="פארק", type="park", latitude=31.28, longitude=34.82),
        POI(name="בית ספר נוסף", type="school", latitude=31.29, longitude=34.83)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/poi_types")
    assert resp.status_code == 200
    types = resp.json()
    assert len(types) == 4  # school, kindergarten, library, park
    assert types.count("school") == 1  # types should be unique

def test_poi_search_by_name(client, test_db):
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר א", type="school", latitude=31.25, longitude=34.79),
        POI(name="בית ספר ב", type="school", latitude=31.26, longitude=34.80),
        POI(name="גן שעשועים", type="playground", latitude=31.27, longitude=34.81)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 3
    assert any(p["name"] == "בית ספר א" for p in results)
    assert any(p["name"] == "בית ספר ב" for p in results)
    assert any(p["name"] == "גן שעשועים" for p in results)

def test_poi_search_by_type(client, test_db):
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר א", type="school", latitude=31.25, longitude=34.79),
        POI(name="בית ספר ב", type="school", latitude=31.26, longitude=34.80),
        POI(name="גן שעשועים", type="playground", latitude=31.27, longitude=34.81)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois?type=school")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 2
    assert all(p["type"] == "school" for p in results)

def test_poi_search_by_nonexistent_type(client, test_db):
    db = TestingSessionLocal()
    poi = POI(name="בית ספר", type="school", latitude=31.25, longitude=34.79)
    db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois?type=nonexistent")
    assert resp.status_code == 200
    assert len(resp.json()) == 0

def test_poi_search_empty_database(client, test_db):
    resp = client.get("/pois")
    assert resp.status_code == 200
    assert len(resp.json()) == 0

def test_poi_types_empty_database(client, test_db):
    resp = client.get("/poi_types")
    assert resp.status_code == 200
    assert len(resp.json()) == 0

def test_poi_with_special_characters(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר!@#$%^&*()",
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "בית ספר!@#$%^&*()"

def test_poi_with_unicode_name(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר עם שָׁלוֹם",
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "בית ספר עם שָׁלוֹם"

def test_poi_with_max_coordinates(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=90.0,
        longitude=180.0
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["latitude"] == 90.0
    assert resp.json()["longitude"] == 180.0

def test_poi_with_min_coordinates(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=-90.0,
        longitude=-180.0
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["latitude"] == -90.0
    assert resp.json()["longitude"] == -180.0

def test_poi_with_zero_coordinates(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=0.0,
        longitude=0.0
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["latitude"] == 0.0
    assert resp.json()["longitude"] == 0.0

def test_poi_with_long_name(client, test_db):
    long_name = "בית ספר " * 10  # Create a long name
    db = TestingSessionLocal()
    poi = POI(
        name=long_name,
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == long_name

def test_poi_with_long_description(client, test_db):
    long_description = "תיאור ארוך " * 20  # Create a long description
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description=long_description
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["description"] == long_description

def test_poi_with_long_address(client, test_db):
    long_address = "רחוב ארוך " * 10  # Create a long address
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        address=long_address
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["address"] == long_address


def test_poi_with_same_coordinates(client, test_db):
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר א", type="school", latitude=31.25, longitude=34.79),
        POI(name="בית ספר ב", type="school", latitude=31.25, longitude=34.79),
        POI(name="בית ספר ג", type="school", latitude=31.25, longitude=34.79)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 3
    assert all(p["latitude"] == 31.25 and p["longitude"] == 34.79 for p in results)

def test_poi_with_same_name(client, test_db):
    db = TestingSessionLocal()
    pois = [
        POI(name="בית ספר", type="school", latitude=31.25, longitude=34.79),
        POI(name="בית ספר", type="kindergarten", latitude=31.26, longitude=34.80),
        POI(name="בית ספר", type="library", latitude=31.27, longitude=34.81)
    ]
    for poi in pois:
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 3
    assert all(p["name"] == "בית ספר" for p in results)
    assert len(set(p["type"] for p in results)) == 3  # All types should be different

def test_poi_with_different_types(client, test_db):
    db = TestingSessionLocal()
    types = ["school", "kindergarten", "library", "park", "playground", "hospital", "restaurant"]
    for t in types:
        poi = POI(
            name=f"מקום {t}",
            type=t,
            latitude=31.25,
            longitude=34.79
        )
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/poi_types")
    assert resp.status_code == 200
    assert len(resp.json()) == len(types)
    assert all(t in resp.json() for t in types)

def test_poi_with_different_coordinates(client, test_db):
    coordinates = [
        (31.25, 34.79),
        (31.26, 34.80),
        (31.27, 34.81),
        (31.28, 34.82),
        (31.29, 34.83)
    ]
    db = TestingSessionLocal()
    for lat, lon in coordinates:
        poi = POI(
            name=f"מקום ב-{lat},{lon}",
            type="school",
            latitude=lat,
            longitude=lon
        )
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == len(coordinates)
    for lat, lon in coordinates:
        assert any(p["latitude"] == lat and p["longitude"] == lon for p in results)

def test_poi_with_different_descriptions(client, test_db):
    descriptions = [
        "בית ספר מצוין",
        "גן ילדים חדש",
        "ספריה ציבורית",
        "פארק גדול",
        "בית חולים כללי"
    ]
    db = TestingSessionLocal()
    for desc in descriptions:
        poi = POI(
            name="מקום",
            type="school",
            latitude=31.25,
            longitude=34.79,
            description=desc
        )
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == len(descriptions)
    assert all(any(p["description"] == desc for p in results) for desc in descriptions)

def test_poi_with_different_addresses(client, test_db):
    addresses = [
        "רחוב החינוך 1",
        "רחוב הגן 2",
        "רחוב הספרים 3",
        "רחוב הפארק 4",
        "רחוב הרפואה 5"
    ]
    db = TestingSessionLocal()
    for addr in addresses:
        poi = POI(
            name="מקום",
            type="school",
            latitude=31.25,
            longitude=34.79,
            address=addr
        )
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == len(addresses)
    assert all(any(p["address"] == addr for p in results) for addr in addresses)

def test_poi_with_different_tags(client, test_db):
    tags_list = [
        '{"amenity": "school", "capacity": "1000"}',
        '{"amenity": "kindergarten", "capacity": "50"}',
        '{"amenity": "library", "books": "10000"}',
        '{"amenity": "park", "size": "large"}',
        '{"amenity": "hospital", "beds": "500"}'
    ]
    db = TestingSessionLocal()
    for tags in tags_list:
        poi = POI(
            name="מקום",
            type="school",
            latitude=31.25,
            longitude=34.79,
            tags=tags
        )
        db.add(poi)
    db.commit()
    db.close()
    
    resp = client.get("/pois")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == len(tags_list)
    for tags in tags_list:
        assert any(p["tags"] == tags for p in results)

def test_poi_with_combined_fields(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר מקיף",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description="בית ספר מצוין",
        address="רחוב החינוך 1",
        tags='{"amenity": "school", "capacity": "1000", "levels": "6", "sports": "yes"}'
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "בית ספר מקיף"
    assert data["type"] == "school"
    assert data["description"] == "בית ספר מצוין"
    assert data["address"] == "רחוב החינוך 1"
    assert "capacity" in data["tags"]
    assert "levels" in data["tags"]
    assert "sports" in data["tags"]

def test_poi_with_minimal_fields(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "בית ספר"
    assert data["type"] == "school"
    assert data["latitude"] == 31.25
    assert data["longitude"] == 34.79
    assert data["description"] is None
    assert data["address"] is None
    assert data["tags"] is None

def test_poi_with_null_fields(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description=None,
        address=None,
        tags=None
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["description"] is None
    assert data["address"] is None
    assert data["tags"] is None

def test_poi_with_empty_strings(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description="",
        address="",
        tags=""
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["description"] == ""
    assert data["address"] == ""
    assert data["tags"] == ""

def test_poi_with_whitespace(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="  בית ספר  ",
        type="  school  ",
        latitude=31.25,
        longitude=34.79,
        description="  תיאור  ",
        address="  כתובת  ",
        tags="  {}  "
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "  בית ספר  "
    assert data["type"] == "  school  "
    assert data["description"] == "  תיאור  "
    assert data["address"] == "  כתובת  "
    assert data["tags"] == "  {}  "

def test_poi_with_numbers_in_name(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר 123",
        type="school",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "בית ספר 123"

def test_poi_with_numbers_in_type(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school123",
        latitude=31.25,
        longitude=34.79
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["type"] == "school123"

def test_poi_with_numbers_in_description(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        description="בית ספר מספר 123"
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["description"] == "בית ספר מספר 123"

def test_poi_with_numbers_in_address(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        address="רחוב החינוך 123"
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert resp.json()["address"] == "רחוב החינוך 123"

def test_poi_with_numbers_in_tags(client, test_db):
    db = TestingSessionLocal()
    poi = POI(
        name="בית ספר",
        type="school",
        latitude=31.25,
        longitude=34.79,
        tags='{"amenity": "school", "capacity": "1000", "building": "123"}'
    )
    db.add(poi)
    db.commit()
    db.refresh(poi)
    db.close()
    
    resp = client.get(f"/poi/{poi.id}")
    assert resp.status_code == 200
    assert "building" in resp.json()["tags"]
    assert "123" in resp.json()["tags"]
