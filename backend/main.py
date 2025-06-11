from fastapi import FastAPI, HTTPException, Depends, Request ,Query
from pydantic import BaseModel, EmailStr
from typing import List, Annotated, Optional
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from geopy.geocoders import Nominatim
import json
import requests
from datetime import date
import os
from sqlalchemy import JSON  # הוסף למעלה אם יש לך SQLAlchemy 1.3+ (אחרת נשתמש ב-Text)
from utils.ranking import score_apartment, calculate_star_rating  






app = FastAPI()
router = FastAPI()



@app.get("/")
def read_root():
    return {"message": "Welcome to SmartEstate API 👋"}

app.add_middleware(SessionMiddleware, secret_key = "your-super-secret-key", max_age = 1800)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
db_dependency = Annotated[Session, Depends(get_db)]

# Only create tables if we're not in a test environment
if not os.environ.get("TESTING"):
    models.Base.metadata.create_all(bind = engine)

geolocator = Nominatim(user_agent="smartestate-app")

class UserBase(BaseModel):
    email:EmailStr
    first_name: str
    last_name: str
    password: str
    is_admin: bool = False

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    

class changePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

class UserPreferencesRequest(BaseModel):
    who: Optional[str] = None
    houseType: Optional[str] = None
    rooms: Optional[str] = None
    features: Optional[List[str]] = []
    importantLayers: Optional[List[str]] = []
    location: Optional[str] = None
    budgetMin: Optional[int] = None
    budgetMax: Optional[int] = None

class MapLayerRequest(BaseModel):
    layers: List[str]  # List of amenity types to show (e.g., ['school', 'kindergarten'])
    bbox: Optional[str] = None  # Optional bounding box for filtering

class POIResponse(BaseModel):
    id: int
    name: str
    type: str
    latitude: float
    longitude: float
    description: Optional[str]
    address: Optional[str]
    tags: Optional[str]

class AdCreateSchema(BaseModel):
    ad_type: str
    property_type: str
    address: str
    rooms: float
    size: int
    price: int
    floor: Optional[int] = None
    has_elevator: Optional[bool] = False
    has_parking: Optional[bool] = False
    description: Optional[str] = None
    publisher_name: str
    contact_phone: str
    has_garden: Optional[bool] = False
    has_balcony: Optional[bool] = False
    pets_allowed: Optional[bool] = False
    accessibility: Optional[bool] = False
    publish_date: Optional[date] = None  # Format: YYYY-MM-DD
    latitude: float
    longitude: float

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    content: str
    rating: int

   
class LikedAdCreate(BaseModel):
    ad_id: int

class LikedAdResponse(BaseModel):
    id: int
    user_id: int
    ad_id: int
    liked_at: date

class ReviewOut(BaseModel):
    id: int
    content: str
    rating: int
    created_at: date
    is_visible: bool
    author_name: str

class VisibilityUpdate(BaseModel):
    is_visible: bool

    class Config:
        from_attributes = True

@app.post("/like/")
def like_ad(request: Request, like_data: LikedAdCreate, db: db_dependency):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(models.LikedAds).filter_by(user_id=db_user.ID, ad_id=like_data.ad_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ad already liked")

    new_like = models.LikedAds(
        user_id=db_user.ID,
        ad_id=like_data.ad_id,
        liked_at=date.today()  # Fixed: removed reference to like_data.liked_at
    )

    db.add(new_like)
    db.commit()
    db.refresh(new_like)

    return {
        "message": "Ad liked successfully",
        "like": {
            "id": new_like.id,
            "user_id": new_like.user_id,
            "ad_id": new_like.ad_id,
            "liked_at": new_like.liked_at
        }
    }
@app.delete("/like/{ad_id}")
def unlike_ad(ad_id: int, request: Request, db: db_dependency):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    like = db.query(models.LikedAds).filter_by(user_id=db_user.ID, ad_id=ad_id).first()
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")

    db.delete(like)
    db.commit()
    return {"message": "Ad unliked successfully"}


@app.get("/likes/")
def get_liked_ads(request: Request, db: Session = Depends(get_db)):
    user_session = request.session.get("user")
    if not user_session:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_user = db.query(models.Users).filter(models.Users.email == user_session["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    liked = db.query(models.LikedAds).filter(models.LikedAds.user_id == db_user.ID).all()

    # 4. Return ad_id list
    return [
        {"id": like.id, "ad_id": like.ad_id, "liked_at": like.liked_at.isoformat()}
        for like in liked
    ]


@app.post("/users/")
async def create_user(user: UserBase, db: db_dependency):
    existing_user = db.query(models.Users).filter(models.Users.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already used!")

    db_user = models.Users(
        first_name = user.first_name,
        last_name = user.last_name,
        password = user.password,  # need to be hashed
        email = user.email,
        is_admin = user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Return user without password
    return {
        "ID": db_user.ID,
        "email": db_user.email,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "is_admin": db_user.is_admin
    }

@app.post("/login/")
async def login(request: Request, login_data: LoginRequest, db: db_dependency):
    user = db.query(models.Users).filter(models.Users.email == login_data.email).first()
    if not user or user.password != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    request.session["user"] = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_admin": user.is_admin
    }
    return {
        "user": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_admin": user.is_admin
        },
        "is_admin": user.is_admin,
        "message": f"Welcome {user.first_name}!"
    }

    

@app.get("/dashboard/")
async def dashboard(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return {
        "user": {  
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
        },
        "message": f"Hello, {user['first_name']}!"
    }

@app.post("/logout/")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}

@app.post("/change-password/")
def change_password(request: Request, change_password_data: changePasswordRequest, db: db_dependency):
    user = db.query(models.Users).filter(models.Users.email == change_password_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.password != change_password_data.current_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    user.password = change_password_data.new_password
    db.commit()
    db.refresh(user)
    return {"message": "Password changed successfully"}


@app.get("/reverse_geocode/")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """
    Receives latitude & longitude and returns a textual address (reverse geocoding).
    """
    location = geolocator.reverse((lat, lon), exactly_one=True, language="he")
    if not location:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"address": location.address}
@app.put("/update-profile/")
def update_profile(request: Request, update_profile_data: UpdateProfileRequest, db: db_dependency):
    user = db.query(models.Users).filter(models.Users.email == update_profile_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.first_name = update_profile_data.first_name
    user.last_name = update_profile_data.last_name
    db.commit()
    db.refresh(user)
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }

@app.post("/user-preferences/")
async def save_user_preferences(request: Request, preferences: UserPreferencesRequest, db: db_dependency):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_preferences = db.query(models.UserPreferences).filter(
        models.UserPreferences.user_id == db_user.ID
    ).first()

    if existing_preferences:
        existing_preferences.who = preferences.who
        existing_preferences.house_type = preferences.houseType
        existing_preferences.features = json.dumps(preferences.features)
        existing_preferences.important_layers = json.dumps(preferences.importantLayers)
        existing_preferences.location = preferences.location
        existing_preferences.budget_min = preferences.budgetMin
        existing_preferences.budget_max = preferences.budgetMax
        existing_preferences.rooms = preferences.rooms
    else:
        new_preferences = models.UserPreferences(
            user_id=db_user.ID,
            who=preferences.who,
            house_type=preferences.houseType,
            features=json.dumps(preferences.features),
            important_layers=json.dumps(preferences.importantLayers),
            location=preferences.location,
            budget_min=preferences.budgetMin,
            budget_max=preferences.budgetMax,
            rooms=preferences.rooms,
        )
        db.add(new_preferences)

    db.commit()
    return {"message": "Preferences saved successfully"}

@app.get("/user-preferences/")
async def get_user_preferences(request: Request, db: db_dependency):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    preferences = db.query(models.UserPreferences).filter(
        models.UserPreferences.user_id == db_user.ID
    ).first()

    if not preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")

    return {
        "who": preferences.who,
        "houseType": preferences.house_type,
        "features": json.loads(preferences.features) if preferences.features else [],
        "importantLayers": json.loads(preferences.important_layers) if preferences.important_layers else [],
        "location": preferences.location,
        "budgetMin": preferences.budget_min,
        "budgetMax": preferences.budget_max,
        "rooms": preferences.rooms,
    }

@app.get("/admin/analytics/users")
async def get_user_analytics(request: Request, db: db_dependency):
    user = request.session.get("user")
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get total users count
    total_users = db.query(models.Users).count()
    
    # Get active users (users who logged in in the last 30 days)
    # For now, we'll return all users as active since we don't track last login
    active_users = total_users
    
    # Get new users (registered in the last 30 days)
    # For now, we'll return all users as new since we don't track registration date
    new_users = total_users

    # Get user activity data (mock data for now)
    user_activity = [
        {"date": "2024-01", "activeUsers": total_users, "newUsers": new_users},
        {"date": "2024-02", "activeUsers": total_users, "newUsers": new_users},
        {"date": "2024-03", "activeUsers": total_users, "newUsers": new_users}
    ]

    # Get user types distribution
    admin_count = db.query(models.Users).filter(models.Users.is_admin == True).count()
    regular_count = total_users - admin_count
    user_types = [
        {"type": "מנהלים", "count": admin_count},
        {"type": "משתמשים רגילים", "count": regular_count}
    ]

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "newUsers": new_users,
        "userActivity": user_activity,
        "userTypes": user_types
    }

@app.get("/map/layers")
async def get_map_layers(request: Request, db: db_dependency):
    """Get available map layers"""
    return {
        "layers": [
            {"id": "school", "name": "בתי ספר"},
            {"id": "kindergarten", "name": "גני ילדים"},
            {"id": "college", "name": "מכללות"},
            {"id": "shelter", "name": "מקלטים"},
            {"id": "hospital", "name": "בתי חולים"},
            {"id": "pharmacy", "name": "בתי מרקחת"},
            {"id": "park", "name": "פארקים"},
            {"id": "playground", "name": "גני שעשועים"}
        ]
    }

@app.post("/map/pois")
async def get_points_of_interest(request: Request, layer_request: MapLayerRequest, db: db_dependency):
    """Get points of interest for selected layers"""
    if not layer_request.layers:
        return {"features": []}

    # Query POIs from database based on requested layers
    query = db.query(models.POI)
    if layer_request.layers:
        query = query.filter(models.POI.type.in_(layer_request.layers))
    
    pois = query.all()
    
    # Convert to GeoJSON
    features = []
    for poi in pois:
        feature = {
            "type": "Feature",
            "properties": {
                "id": str(poi.id),
                "name": poi.name,
                "amenity": poi.type,  # Using the POI type as amenity for frontend compatibility
                "tags": json.loads(poi.tags) if poi.tags else {}
            },
            "geometry": {
                "type": "Point",
                "coordinates": [poi.longitude, poi.latitude]
            }
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.get("/pois", response_model=List[POIResponse])
def get_pois(db: db_dependency, type: Optional[str] = None):
    """Get all POIs, optionally filtered by type"""
    query = db.query(models.POI)
    if type:
        query = query.filter(models.POI.type == type)
    return query.all()

@app.get("/poi_types")
def get_poi_types(db: db_dependency):
    """Get all unique POI types in the database"""
    types = db.query(models.POI.type).distinct().all()
    return [t[0] for t in types if t[0]]  # Filter out None values and extract from tuples

@app.get("/poi/{poi_id}", response_model=POIResponse)
def get_poi(poi_id: int, db: db_dependency):
    """Get a specific POI by ID"""
    poi = db.query(models.POI).filter(models.POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return poi

@app.post("/poi", response_model=POIResponse)
def create_poi(poi: POIResponse, db: db_dependency):
    """Create a new POI"""
    db_poi = models.POI(**poi.dict())
    db.add(db_poi)
    db.commit()
    db.refresh(db_poi)
    return db_poi

@app.put("/poi/{poi_id}", response_model=POIResponse)
def update_poi(poi_id: int, poi: POIResponse, db: db_dependency):
    """Update an existing POI"""
    db_poi = db.query(models.POI).filter(models.POI.id == poi_id).first()
    if not db_poi:
        raise HTTPException(status_code=404, detail="POI not found")
    
    for key, value in poi.dict(exclude_unset=True).items():
        setattr(db_poi, key, value)
    
    db.commit()
    db.refresh(db_poi)
    return db_poi

@app.delete("/poi/{poi_id}")
def delete_poi(poi_id: int, db: db_dependency):
    """Delete a POI"""
    db_poi = db.query(models.POI).filter(models.POI.id == poi_id).first()
    if not db_poi:
        raise HTTPException(status_code=404, detail="POI not found")
    
    db.delete(db_poi)
    db.commit()
    return {"message": "POI deleted successfully"}

@app.get("/search")
async def search_pois(q: str, db: db_dependency):
    """Search POIs and addresses"""
    results = []
    
    # חיפוש ב-POIs
    query = db.query(models.POI).filter(
        models.POI.name.ilike(f"%{q}%")
    )
    poi_results = query.all()
    
    # המרת תוצאות ה-POIs לפורמט אחיד
    results.extend([{
        "name": poi.name,
        "type": poi.type,
        "latitude": poi.latitude,
        "longitude": poi.longitude,
        "address": poi.address,
        "source": "poi"
    } for poi in poi_results])
    
    # חיפוש כתובת באמצעות geocoding
    try:
        # הוספת "באר שבע" לחיפוש אם לא צוין
        search_query = q if "באר שבע" in q.lower() else f"{q}, באר שבע"
        locations = geolocator.geocode(
            search_query,
            exactly_one=False,
            language="he",
            country_codes=["il"],
            limit=5
        )
        
        if locations:
            for location in locations:
                # בדיקה שהמיקום אכן בבאר שבע
                if "באר שבע" in location.address:
                    results.append({
                        "name": location.address,
                        "type": "address",
                        "latitude": location.latitude,
                        "longitude": location.longitude,
                        "address": location.address,
                        "source": "geocoding"
                    })
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return results

@app.get("/admin/users/{user_id}")
async def get_user_by_id(user_id: int, request: Request, db: Session = Depends(get_db)):
    user = request.session.get("user")
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    db_user = db.query(models.Users).filter(models.Users.ID == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "ID": db_user.ID,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "email": db_user.email,
        "is_admin": db_user.is_admin,
    }


@app.delete("/users/{user_id}")
def delete_user(user_id: int, request: Request, db: Session = Depends(get_db)):
    # Check if user is admin
    user_session = request.session.get("user")
    if not user_session or not user_session.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized - Admin privileges required")
    
    # Find the user by ID
    user = db.query(models.Users).filter(models.Users.ID == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting yourself
    if user.email == user_session.get("email"):
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Delete the user
    try:
        db.delete(user)
        db.commit()
        return {"detail": f"User with ID {user_id} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/admin/users")
async def get_all_users(request: Request, db: Session = Depends(get_db)):
    user = request.session.get("user")
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    users = db.query(models.Users).all()

    return [
        {
            "ID": u.ID,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "is_admin": u.is_admin,
        }
        for u in users
    ]

@app.post("/ads/")
def create_ad(request: Request, ad_data: AdCreateSchema, db: db_dependency):
    print("Session content:", request.session.items())
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    new_ad = models.Ad(
        user_id=db_user.ID,
        ad_type=ad_data.ad_type,
        property_type=ad_data.property_type,
        address=ad_data.address,
        latitude=ad_data.latitude,
        longitude=ad_data.longitude,
        rooms=ad_data.rooms,
        size=ad_data.size,
        price=ad_data.price,
        floor=ad_data.floor,
        has_elevator=ad_data.has_elevator,
        has_parking=ad_data.has_parking,
        description=ad_data.description,
        publisher_name=ad_data.publisher_name,
        contact_phone=ad_data.contact_phone,
        has_garden=ad_data.has_garden,
        has_balcony=ad_data.has_balcony,
        pets_allowed=ad_data.pets_allowed,
        accessibility=ad_data.accessibility,
        publish_date=ad_data.publish_date
        
    )
    db.add(new_ad)
    db.commit()
    db.refresh(new_ad)
    return new_ad

@app.get("/admin/ads")
async def get_all_ads(request: Request, db: Session = Depends(get_db)):
    user = request.session.get("user")
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    ads = db.query(models.Ad).all()

    return [
        {
            "id": ad.id,
            "user_id": ad.user_id,
            "ad_type": ad.ad_type,
            "property_type": ad.property_type,
            "address": ad.address,
            "rooms": ad.rooms,
            "size": ad.size,
            "price": ad.price,
            "floor": ad.floor,
            "has_elevator": ad.has_elevator,
            "has_parking": ad.has_parking,
            "has_balcony": ad.has_balcony,
            "has_garden": ad.has_garden,
            "pets_allowed": ad.pets_allowed,
            "accessibility": ad.accessibility,
            "publisher_name": ad.publisher_name,
            "contact_phone": ad.contact_phone,
            "publish_date": str(ad.publish_date) if ad.publish_date else None
        }
        for ad in ads
    ]

@app.delete("/ads/{ad_id}")
def delete_ad(ad_id: int, request: Request, db: Session = Depends(get_db)):
    # Check if user is admin
    user_session = request.session.get("user")
    if not user_session or not user_session.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized - Admin privileges required")
    
    # Find the ad by ID
    ad = db.query(models.Ad).filter(models.Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    # Delete the ad
    try:
        db.delete(ad)
        db.commit()
        return {"detail": f"Ad with ID {ad_id} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    


@app.post("/reviews/")
def create_review(
    request: Request, 
    review_data: ReviewCreate, 
    db: Session = Depends(get_db)
):
    # Check if user is authenticated
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Get user from database using session information
    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create new review with the user_id from the authenticated user
    new_review = models.Review(
        user_id=db_user.ID,
        content=review_data.content,
        rating=review_data.rating,
        created_at=date.today()  # Make sure this matches your model
    )
    
    # Add review to database, commit changes, and refresh to get the full object
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "id": new_review.id,
        "user_id": new_review.user_id,
        "content": new_review.content,
        "rating": new_review.rating,
        "created_at": new_review.created_at
    }

@app.get("/reviews/")
def get_reviews(db: Session = Depends(get_db)):
    # Get all reviews from the database
    reviews = db.query(models.Review).all()
    
    # Convert reviews to a list of dictionaries for easier JSON serialization
    review_list = [
        {
            "id": review.id,
            "user_id": review.user_id,
            "content": review.content,
            "rating": review.rating,
            "created_at": review.created_at.isoformat() if review.created_at else None
        }
        for review in reviews
    ]
    
    return review_list

@app.get("/admin/reviews/")
def get_reviews_for_admin(request: Request, db: Session = Depends(get_db)):
    user = request.session.get("user")
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")
    """Get all reviews for admin dashboard"""
    reviews = db.query(models.Review).all()
    
    # Convert reviews to a list of dictionaries for easier JSON serialization
    review_list = [
        {
            "id": review.id,
            "user_id": review.user_id,
            "author_name": f"{review.user.first_name} {review.user.last_name}" if review.user else "Unknown",
            "content": review.content,
            "rating": review.rating,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "is_visible": review.is_visible
        }
        for review in reviews
    ]
    
    return review_list

@app.patch("/admin/reviews/{review_id}/visibility")
def update_review_visibility(review_id: int, visibility_update: VisibilityUpdate, request: Request, db: Session = Depends(get_db)):
    user = request.session.get("user")
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_visible = visibility_update.is_visible
    db.commit()

    return {"success": True, "is_visible": review.is_visible}


@app.get("/reviews/visible")
def get_visible_reviews(db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.is_visible == True).all()
    reviews_for_show=[
        {
            "id": r.id,
            "content": r.content,
            "rating": r.rating,
            "author_name": f"{r.user.first_name} {r.user.last_name}" if r.user else "אנונימי"
        }
        for r in reviews
    ]
    print("Visible reviews:", reviews_for_show)
    return reviews_for_show

    


@app.get("/ads")
async def get_ads(request: Request, db: db_dependency):
    """Get all ads for display on map"""
    user = request.session.get("user")
    preferences = None
    if user:
        db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
        if db_user:
            preferences = db.query(models.UserPreferences).filter(
                models.UserPreferences.user_id == db_user.ID
            ).first()

    ads = db.query(models.Ad).all()
    
    # Convert ads to a format suitable for the frontend
    ad_list = []
    for ad in ads:
        ad_dict = {
            "id": ad.id,
            "ad_type": ad.ad_type,
            "property_type": ad.property_type,
            "address": ad.address,
            "latitude": ad.latitude,
            "longitude": ad.longitude,
            "rooms": ad.rooms,
            "size": ad.size,
            "price": ad.price,
            "floor": ad.floor,
            "publisher_name": ad.publisher_name,
            "contact_phone": ad.contact_phone,
            "has_elevator": ad.has_elevator,
            "has_parking": ad.has_parking,
            "has_balcony": ad.has_balcony,
            "has_garden": ad.has_garden,
            "pets_allowed": ad.pets_allowed,
            "accessibility": ad.accessibility,
            "publish_date": ad.publish_date.isoformat() if ad.publish_date else None,
            "description": ad.description
        }
        if preferences:
            score = score_apartment(ad, preferences)
            stars = calculate_star_rating(score)
            ad_dict["score"] = score
            ad_dict["stars"] = stars
        ad_list.append(ad_dict)
    
    return ad_list

@app.get("/ads/{ad_id}")
def get_ad(ad_id: int, db: db_dependency):
    ad = db.query(models.Ad).filter(models.Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    return ad


