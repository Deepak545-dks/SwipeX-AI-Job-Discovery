# verify_deck.py
import os
import django

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'swipex.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.urls import reverse
from jobs.seeder import seed_db_if_empty

def run_verification():
    print("=== SwipeX Deck API Verification ===")
    
    # 1. Ensure database has seeded jobs
    seed_db_if_empty()
    
    User = get_user_model()
    
    # 2. Get or create seeker user for authentication
    seeker, created = User.objects.get_or_create(
        email="seeker@example.com",
        defaults={
            "role": "job_seeker",
            "is_verified": True,
            "is_active": True
        }
    )
    if created:
        seeker.set_password("Password123!")
        seeker.save()
        print("Created temporary seeker account seeker@example.com")
    else:
        print("Using existing seeker account seeker@example.com")
        
    # 3. Initialize API client and authenticate
    client = APIClient()
    client.force_authenticate(user=seeker)
    
    # 4. Call /jobs/deck/ endpoint
    deck_url = reverse('job_deck')
    print(f"Calling deck API: {deck_url}")
    
    response = client.get(deck_url)
    
    # 5. Output results
    if response.status_code == 200:
        results = response.data.get('results', [])
        count = len(results)
        print(f"Success! Status Code: 200")
        print(f"Total jobs returned in current deck: {count}")
        if count > 0:
            print("\nFirst 10 jobs in the deck:")
            for i, job in enumerate(results[:10]):
                company_name = job.get('company', {}).get('name', 'Unknown')
                print(f"  {i+1}. {job['title']} at {company_name} (${job['salary_min']} - ${job['salary_max']})")
        else:
            print("Warning: Deck returned 0 jobs!")
    else:
        print(f"Error! API returned status {response.status_code}")
        print(response.data)

if __name__ == "__main__":
    run_verification()
