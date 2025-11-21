# SmartEstate

SmartEstate is a full-stack real-estate analytics platform that helps users explore properties with smarter insights.  
It combines advanced search, user reviews, and pricing analytics to make real-estate decisions more transparent and data-driven.

## Tech Stack

- **Frontend:** React
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL

## Core Features (Planned / In Progress)

- Property search and filtering by key criteria (location, rooms, price, etc.)
- Price insights and analytics based on historical and current listings
- User reviews and ratings for properties and neighborhoods
- Admin tools for managing listings and user activity

## How to Run

### 1. Start the backend (FastAPI)

Open a new terminal and run:

cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

### 2. Start the frontend
Open another new terminal and run:
cd SmartEstate
npm run dev
