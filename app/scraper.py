import time
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://books.toscrape.com/"
RATING_MAP = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}

def scrape_catalog():
    client = httpx.Client(timeout=10.0, follow_redirects=True)
    try:
        response = client.get(BASE_URL)
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to reach base URL: {e}")
        return []

    soup = BeautifulSoup(response.text, "lxml")
    category_tags = soup.select(".side_categories ul.nav-list ul li a")
    
    scraped_books = []

    for cat in category_tags:
        cat_name = cat.text.strip()
        cat_url = urljoin(BASE_URL, cat['href'])
        
        current_page_url = cat_url
        while current_page_url:
            try:
                time.sleep(0.5)  # Rate limiting delay between requests
                resp = client.get(current_page_url)
                if resp.status_code != 200:
                    break
                
                page_soup = BeautifulSoup(resp.text, "lxml")
                books = page_soup.select("article.product_pod")
                
                for book in books:
                    try:
                        title = book.h3.a["title"]
                        rel_product_url = book.h3.a["href"]
                        product_url = urljoin(current_page_url, rel_product_url)
                        
                        price_str = book.select_one(".price_color").text
                        price = float(price_str.replace("£", "").replace("Â", "").strip())
                        
                        stock_text = book.select_one(".availability").text.strip()
                        availability = "In Stock" if "In stock" in stock_text else "Out of Stock"
                        
                        rating_class = book.select_one("p.star-rating")["class"]
                        rating_word = [c for c in rating_class if c != "star-rating"][0]
                        rating = RATING_MAP.get(rating_word, 0)
                        
                        img_rel = book.select_one("img.thumbnail")["src"]
                        image_url = urljoin(BASE_URL, img_rel)
                        
                        scraped_books.append({
                            "title": title,
                            "price": price,
                            "rating": rating,
                            "availability": availability,
                            "category": cat_name,
                            "product_url": product_url,
                            "image_url": image_url
                        })
                    except Exception:
                        continue

                next_btn = page_soup.select_one("li.next > a")
                if next_btn:
                    current_page_url = urljoin(current_page_url, next_btn["href"])
                else:
                    current_page_url = None
            except Exception:
                break

    client.close()
    return scraped_books