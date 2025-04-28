from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Float, Date
from database import Base
from datetime import date


class Users(Base):
    __tablename__ = 'Users'

    ID = Column(Integer, primary_key=True, index= True)
    email = Column(String, nullable= False)
    first_name = Column(String, nullable= False)
    last_name = Column(String, nullable = False)
    password = Column(String, nullable = False)
    is_admin = Column(Boolean, nullable = False)

class UserPreferences(Base):
    __tablename__ = 'UserPreferences'

    ID = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('Users.ID'), nullable=False)
    property_type = Column(String, nullable=False)
    budget = Column(Integer, nullable=False)
    location = Column(String, nullable=False)
    rooms = Column(String, nullable=False)
    size = Column(Integer, nullable=False)
    parking = Column(Boolean, default=False)
    elevator = Column(Boolean, default=False)
    balcony = Column(Boolean, default=False)
    garden = Column(Boolean, default=False)
    pets_allowed = Column(Boolean, default=False)
    accessibility = Column(Boolean, default=False)
    additional_notes = Column(Text)

class OSMData(Base):
    __tablename__ = 'osm_data'

    ID = Column(Integer, primary_key=True, index=True)
    osm_id = Column(String, nullable=False)
    name = Column(String)
    amenity = Column(String, nullable=False)  # Type of amenity (school, kindergarten, etc.)
    latitude = Column(Float, nullable=False)  # Latitude coordinate
    longitude = Column(Float, nullable=False)  # Longitude coordinate
    tags = Column(Text)  # Store additional OSM tags as JSON

class POI(Base):
    __tablename__ = "pois"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    description = Column(Text, nullable=True)
    address = Column(String, nullable=True)
    tags = Column(Text, nullable=True)  # Store additional OSM tags as JSON string

class Ad(Base):
    __tablename__ = 'ads'  

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('Users.ID'), nullable=False)
    publisher_name = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    ad_type = Column(String, nullable=False)  # "מכירה" או "השכרה"
    property_type = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)  # Latitude coordinate
    longitude = Column(Float, nullable=False)  # Longitude coordinate
    rooms = Column(Float, nullable=False)
    size = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False)
    floor = Column(Integer, nullable=True)
    has_elevator = Column(Boolean, default=False)
    has_parking = Column(Boolean, default=False)
    has_balcony = Column(Boolean, default=False)
    has_garden = Column(Boolean, default=False)
    pets_allowed = Column(Boolean, default=False)
    accessibility = Column(Boolean, default=False)
    publish_date = Column(Date, nullable=False, default=date.today)
    description = Column(Text, nullable=True)
