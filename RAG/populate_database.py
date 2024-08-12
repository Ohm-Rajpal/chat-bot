import argparse
import os
import shutil
import hashlib
import logging
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.schema import Document
from get_embedding_function import get_embedding_function
from langchain_community.vectorstores import Chroma
from tqdm import tqdm

# Configuration
CHROMA_PATH = "chroma"
DATA_PATH = "data"
BATCH_SIZE = 100  

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Reset the database.")
    args = parser.parse_args()

    if args.reset:
        logging.info("✨ Clearing Database")
        clear_database()

    documents = load_documents()
    if not documents:
        logging.error("No documents loaded.")
        return

    add_to_chroma_in_batches(documents, BATCH_SIZE)

def load_documents():
    try:
        document_loader = PyPDFDirectoryLoader(DATA_PATH)
        documents = document_loader.load()
        logging.info(f"Loaded {len(documents)} documents.")
        return documents
    except Exception as e:
        logging.error(f"Failed to load documents: {e}")
        return []

def add_to_chroma_in_batches(documents: list[Document], batch_size: int):
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=get_embedding_function())
    
    documents_with_ids = calculate_document_ids(documents)
    existing_items = db.get(include=[])
    existing_ids = set(existing_items["ids"])
    logging.info(f"Number of existing documents in DB: {len(existing_ids)}")

    new_documents = [doc for doc in documents_with_ids if doc.metadata["id"] not in existing_ids]

    for i in tqdm(range(0, len(new_documents), batch_size), desc="Adding documents to Chroma"):
        batch = new_documents[i:i+batch_size]
        logging.info(f"👉 Adding batch of {len(batch)} documents.")
        new_document_ids = [doc.metadata["id"] for doc in batch]
        db.add_documents(batch, ids=new_document_ids)
        logging.info(f"✅ Added batch of {len(batch)} documents.")

def calculate_document_ids(documents):
    for index, document in enumerate(documents):
        source = document.metadata.get("source")
        # Create a unique document ID by hashing the source combined with an index
        document_id = f"{source}:{index}"
        document.metadata["id"] = hashlib.md5(document_id.encode()).hexdigest()
    return documents

def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)
        logging.info("Database cleared.")

if __name__ == "__main__":
    main()
