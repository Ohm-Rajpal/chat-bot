import os
import argparse
import requests
from bs4 import BeautifulSoup
from fpdf import FPDF

# In writing the code, I used PubMed as an example of where I scraped data from 
DATA_PATH = "data"
PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_FETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", type=str, required=True, help="Search query for PubMed")
    parser.add_argument("--num_pdfs", type=int, default=50, help="Number of PDFs to find")
    parser.add_argument("--data_path", type=str, default=DATA_PATH, help="Path to the directory to save PDFs")
    args = parser.parse_args()

    if not os.path.exists(args.data_path):
        os.makedirs(args.data_path)

    found_pdfs = 0
    start_index = 0

    while found_pdfs < args.num_pdfs:
        print(f"Fetching articles starting from index {start_index}...")
        article_ids = search_pubmed(args.query, 100, start_index)
        found_pdfs += fetch_and_save_abstracts(article_ids, args.data_path, args.num_pdfs - found_pdfs)
        
        if not article_ids:
            break  # No more articles found
        start_index += 100

    if found_pdfs < args.num_pdfs:
        print(f"Found only {found_pdfs} abstracts.")
    else:
        print(f"Successfully found {found_pdfs} abstracts.")

def search_pubmed(query, max_results, start_index):
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retstart": start_index,
        "retmode": "json"
    }
    response = requests.get(PUBMED_SEARCH_URL, params=params)
    response.raise_for_status()
    data = response.json()
    article_ids = data["esearchresult"]["idlist"]
    return article_ids

def fetch_and_save_abstracts(article_ids, data_path, num_pdfs_needed):
    found_pdfs = 0

    for article_id in article_ids:
        if found_pdfs >= num_pdfs_needed:
            break

        params = {
            "db": "pubmed",
            "id": article_id,
            "retmode": "xml"
        }
        response = requests.get(PUBMED_FETCH_URL, params=params)
        response.raise_for_status()
        article_details = response.content

        soup = BeautifulSoup(article_details, "xml")
        article_title = soup.find("ArticleTitle").text
        article_title_sanitized = "".join(x for x in article_title if (x.isalnum() or x in "._- ")).strip()
        
        abstract_sections = soup.find_all("AbstractText")
        abstract_texts = [format_abstract_section(section) for section in abstract_sections]
        abstract_text = "\n\n".join(abstract_texts)

        if not abstract_text:
            abstract_text = "No abstract available."

        # Determine if "ABSTRACT:" should be added
        add_abstract_label = len(abstract_texts) == 1

        pdf_path = os.path.join(data_path, f"{article_title_sanitized}.pdf")
        try:
            save_text_as_pdf(article_title, abstract_text, pdf_path, add_abstract_label)
            print(f"Saved PDF: {pdf_path}")
            found_pdfs += 1
        except Exception as e:
            print(f"Failed to save PDF for {article_title}: {e}")

    return found_pdfs

def format_abstract_section(section):
    label = section.get('Label')
    if label:
        return f"{label}:\n{section.text}"
    else:
        return section.text

def save_text_as_pdf(title, text, file_path, add_abstract_label):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)
    try:
        pdf.multi_cell(0, 10, f"TITLE: {title}".encode('latin-1', 'replace').decode('latin-1'))
        pdf.ln()
        pdf.set_font("Arial", size=10)
        if add_abstract_label:
            text = f"ABSTRACT:\n\n{text}"
        pdf.multi_cell(0, 10, text.encode('latin-1', 'replace').decode('latin-1'))
        pdf.output(file_path)
    except Exception as e:
        print(f"Error saving PDF: {e}")
        raise

if __name__ == "__main__":
    main()
