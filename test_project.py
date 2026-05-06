"""
Test script for KaryaKata Next.js project
Tests: Home, Articles, Login, Register pages load correctly
"""
from playwright.sync_api import sync_playwright

def test_project():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # Test 1: Home page
            print("Testing Home page...")
            page.goto('http://localhost:3000', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            title = page.title()
            print(f"  [OK] Home page loaded: {title}")
            
            # Test 2: Articles page
            print("Testing Articles page...")
            page.goto('http://localhost:3000/articles', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            print(f"  [OK] Articles page loaded: {page.title()}")
            
            # Test 3: Login page
            print("Testing Login page...")
            page.goto('http://localhost:3000/login', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            print(f"  [OK] Login page loaded: {page.title()}")
            
            # Test 4: Register page
            print("Testing Register page...")
            page.goto('http://localhost:3000/register', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=60000)
            print(f"  [OK] Register page loaded: {page.title()}")
            
            print("\n[SUCCESS] All tests passed!")
            
        except Exception as e:
            print(f"\n[FAILED] Test failed: {e}")
            try:
                content = page.content()
                print(f"\nPage content snippet:\n{content[:500]}...")
            except:
                pass
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    test_project()
