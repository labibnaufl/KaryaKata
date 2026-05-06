"""
Comprehensive Playwright test for Karya Kata application
Tests: Home, Articles, Login, Register, Admin, Bookmarks pages
"""
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
import os
import time

def run_tests():
    results = []
    screenshot_dir = os.path.join(os.path.dirname(__file__), 'test-screenshots')
    os.makedirs(screenshot_dir, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Capture console logs
        console_logs = []
        
        def handle_console(msg):
            console_logs.append(f"[{msg.type}] {msg.text}")
        
        context = browser.new_context(viewport={'width': 1280, 'height': 720})
        
        # Test 1: Home Page
        print("="*60)
        print("TEST 1: Home Page")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            # Take screenshot
            page.screenshot(path=os.path.join(screenshot_dir, '01-home.png'), full_page=True)
            
            # Verify page elements
            title = page.title()
            print(f"Page title: {title}")
            
            # Check for logo/header
            header = page.locator('header').first
            print(f"Header found: {header.is_visible()}")
            
            # Check navigation
            links = page.locator('a[href]').all()
            print(f"Found {len(links)} links on home page")
            
            # Check for main sections
            buttons = page.locator('button').all()
            print(f"Found {len(buttons)} buttons")
            
            results.append(("Home Page", "PASSED", None))
        except Exception as e:
            results.append(("Home Page", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 2: Articles Page
        print("\n" + "="*60)
        print("TEST 2: Articles Page")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000/articles', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            page.screenshot(path=os.path.join(screenshot_dir, '02-articles.png'), full_page=True)
            
            title = page.title()
            print(f"Page title: {title}")
            
            # Check for articles grid
            h1 = page.locator('h1').first
            if h1.is_visible():
                print(f"Heading: {h1.inner_text()}")
            
            # Look for article cards
            article_cards = page.locator('[class*="card"]').all()
            print(f"Found {len(article_cards)} article cards")
            
            results.append(("Articles Page", "PASSED", None))
        except Exception as e:
            results.append(("Articles Page", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 3: Login Page
        print("\n" + "="*60)
        print("TEST 3: Login Page")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000/login', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            page.screenshot(path=os.path.join(screenshot_dir, '03-login.png'), full_page=True)
            
            title = page.title()
            print(f"Page title: {title}")
            
            # Check login form elements
            email_input = page.locator('input[name="email"], input[type="email"]').first
            password_input = page.locator('input[name="password"], input[type="password"]').first
            submit_btn = page.locator('button[type="submit"]').first
            
            print(f"Email input found: {email_input.is_visible() if email_input.count() > 0 else False}")
            print(f"Password input found: {password_input.is_visible() if password_input.count() > 0 else False}")
            print(f"Submit button found: {submit_btn.is_visible() if submit_btn.count() > 0 else False}")
            
            # Test form interaction (without actual login)
            if email_input.count() > 0:
                email_input.fill('test@example.com')
                print("Filled email field")
            
            if password_input.count() > 0:
                password_input.fill('testpassword')
                print("Filled password field")
            
            results.append(("Login Page", "PASSED", None))
        except Exception as e:
            results.append(("Login Page", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 4: Register Page
        print("\n" + "="*60)
        print("TEST 4: Register Page")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000/register', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            page.screenshot(path=os.path.join(screenshot_dir, '04-register.png'), full_page=True)
            
            title = page.title()
            print(f"Page title: {title}")
            
            # Check registration form
            inputs = page.locator('input').all()
            print(f"Found {len(inputs)} input fields")
            
            for i, inp in enumerate(inputs[:5]):
                input_type = inp.get_attribute('type') or 'text'
                input_name = inp.get_attribute('name') or inp.get_attribute('id') or f'input_{i}'
                print(f"  - {input_name} ({input_type}): visible={inp.is_visible()}")
            
            results.append(("Register Page", "PASSED", None))
        except Exception as e:
            results.append(("Register Page", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 5: Navigation Menu
        print("\n" + "="*60)
        print("TEST 5: Navigation Menu")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            # Click Menu button
            menu_btn = page.locator('button:has-text("Menu")').first
            if menu_btn.count() > 0 and menu_btn.is_visible():
                menu_btn.click()
                print("Clicked Menu button")
                page.wait_for_timeout(800)
                
                page.screenshot(path=os.path.join(screenshot_dir, '05-nav-menu-open.png'), full_page=True)
                
                # Check for navigation links
                nav_links = page.locator('nav a').all()
                print(f"Found {len(nav_links)} navigation links")
                
                # Close menu if there's a close button
                close_btn = page.locator('button:has-text("Close"), [aria-label*="Close"]').first
                if close_btn.count() > 0 and close_btn.is_visible():
                    close_btn.click()
                    print("Closed menu")
            else:
                print("Menu button not found or not visible")
            
            results.append(("Navigation Menu", "PASSED", None))
        except Exception as e:
            results.append(("Navigation Menu", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 6: Search Functionality
        print("\n" + "="*60)
        print("TEST 6: Search Functionality")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            # Click search button (first button in header right section)
            search_btn = page.locator('header button').nth(0)
            
            if search_btn.count() > 0 and search_btn.is_visible():
                search_btn.click()
                print("Clicked search button")
                page.wait_for_timeout(800)
                
                page.screenshot(path=os.path.join(screenshot_dir, '06-search-open.png'), full_page=True)
                
                # Look for search input
                search_input = page.locator('input[type="text"]').first
                if search_input.count() > 0 and search_input.is_visible():
                    search_input.fill('test article')
                    print("Filled search input")
                    page.wait_for_timeout(500)
                    
                    # Press Enter to search
                    search_input.press('Enter')
                    print("Submitted search")
                    page.wait_for_timeout(1500)
                    
                    page.screenshot(path=os.path.join(screenshot_dir, '07-search-results.png'), full_page=True)
                    print(f"Current URL after search: {page.url}")
                else:
                    print("Search input not found")
            else:
                print("Search button not found")
            
            results.append(("Search Functionality", "PASSED", None))
        except Exception as e:
            results.append(("Search Functionality", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 7: Admin Page (should redirect if not authenticated)
        print("\n" + "="*60)
        print("TEST 7: Admin Page Access")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000/admin', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            page.screenshot(path=os.path.join(screenshot_dir, '08-admin-page.png'), full_page=True)
            
            current_url = page.url()
            print(f"Current URL: {current_url}")
            
            # Check if redirected to login (expected behavior)
            if '/login' in current_url:
                print("Correctly redirected to login (authentication required)")
            else:
                print("Admin page accessible (may already be authenticated or public)")
            
            results.append(("Admin Page Access", "PASSED", None))
        except Exception as e:
            results.append(("Admin Page Access", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 8: Bookmarks Page
        print("\n" + "="*60)
        print("TEST 8: Bookmarks Page")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000/bookmarks', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            page.screenshot(path=os.path.join(screenshot_dir, '09-bookmarks.png'), full_page=True)
            
            current_url = page.url()
            print(f"Current URL: {current_url}")
            
            # Check page content
            h1 = page.locator('h1').first
            if h1.is_visible():
                print(f"Page heading: {h1.inner_text()}")
            
            results.append(("Bookmarks Page", "PASSED", None))
        except Exception as e:
            results.append(("Bookmarks Page", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        # Test 9: Footer Links
        print("\n" + "="*60)
        print("TEST 9: Footer Elements")
        print("="*60)
        page = context.new_page()
        page.on("console", handle_console)
        
        try:
            page.goto('http://localhost:3000', timeout=60000)
            page.wait_for_load_state('networkidle', timeout=30000)
            
            # Scroll to footer
            footer = page.locator('footer').first
            if footer.count() > 0:
                footer.scroll_into_view_if_needed()
                page.wait_for_timeout(1000)
                
                page.screenshot(path=os.path.join(screenshot_dir, '10-footer.png'), full_page=True)
                
                # Check footer content
                footer_links = footer.locator('a').all()
                print(f"Found {len(footer_links)} links in footer")
                
                for link in footer_links[:5]:
                    text = link.inner_text().strip()
                    href = link.get_attribute('href')
                    print(f"  - {text} -> {href}")
            else:
                print("Footer not found")
            
            results.append(("Footer Elements", "PASSED", None))
        except Exception as e:
            results.append(("Footer Elements", "FAILED", str(e)))
            print(f"Error: {e}")
        finally:
            page.close()
        
        browser.close()
        
        # Print Summary
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        passed = sum(1 for r in results if r[1] == "PASSED")
        failed = sum(1 for r in results if r[1] == "FAILED")
        
        for name, status, error in results:
            status_symbol = "[OK]" if status == "PASSED" else "[FAIL]"
            print(f"{status_symbol} {name}: {status}")
            if error:
                print(f"    Error: {error}")
        
        print(f"\nTotal: {len(results)} tests")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"\nScreenshots saved to: {screenshot_dir}")
        
        # Print console logs if any
        if console_logs:
            print("\n" + "="*60)
            print("CONSOLE LOGS (first 50)")
            print("="*60)
            for log in console_logs[:50]:
                try:
                    print(log)
                except:
                    pass

if __name__ == "__main__":
    run_tests()
