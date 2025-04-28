
import pytest
from fastapi.testclient import TestClient
import sys
import os
from typing import Generator

# Add the parent directory to path so we can import the main app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

@pytest.fixture
def client() -> Generator:
    """
    Create a test client for the FastAPI application.
    This fixture will be used by the test functions.
    """
    with TestClient(app) as test_client:
        yield test_client