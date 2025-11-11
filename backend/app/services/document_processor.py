"""Service for processing documents and extracting text."""
import logging
from pathlib import Path
from typing import Dict, List

import tiktoken

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Service for processing documents and splitting them into chunks."""

    def __init__(self):
        """Initialize the document processor."""
        self._encoding = None

    @property
    def encoding(self):
        """Lazy load the tiktoken encoding on first access."""
        if self._encoding is None:
            try:
                self._encoding = tiktoken.encoding_for_model("gpt-4o")
                logger.info("Initialized DocumentProcessor with gpt-4o encoding")
            except Exception as e:
                logger.warning(
                    f"Error loading gpt-4o encoding: {e}, falling back to cl100k_base"
                )
                try:
                    self._encoding = tiktoken.get_encoding("cl100k_base")
                except Exception as e2:
                    logger.error(f"Error loading cl100k_base encoding: {e2}")
                    # Create a dummy encoding that falls back to character counting
                    self._encoding = None
        return self._encoding

    def count_tokens(self, text: str) -> int:
        """
        Count tokens in a text string.

        Args:
            text: The text to count tokens for

        Returns:
            Number of tokens in the text
        """
        if not text:
            return 0
        try:
            if self.encoding is not None:
                return len(self.encoding.encode(text))
            else:
                # Fallback: rough estimate of 4 chars per token
                return len(text) // 4
        except Exception as e:
            logger.error(f"Error counting tokens: {e}")
            # Fallback: rough estimate of 4 chars per token
            return len(text) // 4

    def extract_text_pdf(self, file_path: str) -> List[Dict]:
        """
        Extract text from a PDF file by pages.

        Args:
            file_path: Path to the PDF file

        Returns:
            List of dictionaries with page_number, page_total, and text
        """
        try:
            import PyPDF2

            pages = []
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                total_pages = len(reader.pages)

                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text.strip():  # Only add non-empty pages
                        pages.append(
                            {
                                "page_number": i + 1,
                                "page_total": total_pages,
                                "text": text,
                            }
                        )

            logger.info(f"Extracted {len(pages)} pages from PDF: {file_path}")
            return pages

        except ImportError:
            logger.error("PyPDF2 not installed. Cannot process PDF files.")
            raise
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {e}")
            raise

    def extract_text_docx(self, file_path: str) -> List[Dict]:
        """
        Extract text from a DOCX file.

        Args:
            file_path: Path to the DOCX file

        Returns:
            List with a single dictionary containing the document text
        """
        try:
            from docx import Document as DocxDocument

            doc = DocxDocument(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = "\n\n".join(paragraphs)

            logger.info(
                f"Extracted {len(paragraphs)} paragraphs from DOCX: {file_path}"
            )

            return [{"page_number": 1, "page_total": 1, "text": text}]

        except ImportError:
            logger.error("python-docx not installed. Cannot process DOCX files.")
            raise
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {e}")
            raise

    def extract_text_txt(self, file_path: str) -> List[Dict]:
        """
        Read text from a plain text file.

        Args:
            file_path: Path to the text file

        Returns:
            List with a single dictionary containing the file text
        """
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                text = file.read()

            logger.info(f"Read {len(text)} characters from TXT: {file_path}")

            return [{"page_number": 1, "page_total": 1, "text": text}]

        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {e}")
            raise

    def chunk_text(
        self, text: str, max_tokens: int, overlap_tokens: int
    ) -> List[Dict]:
        """
        Split text into chunks with token-based splitting.

        Args:
            text: Text to split
            max_tokens: Maximum tokens per chunk
            overlap_tokens: Number of tokens to overlap between chunks

        Returns:
            List of dictionaries with content and token_count
        """
        if not text.strip():
            return []

        try:
            from langchain.text_splitter import RecursiveCharacterTextSplitter

            splitter = RecursiveCharacterTextSplitter(
                chunk_size=max_tokens,
                chunk_overlap=overlap_tokens,
                length_function=self.count_tokens,
                separators=["\n\n", "\n", ". ", " ", ""],
            )

            chunks = splitter.split_text(text)
            result = []

            for chunk in chunks:
                if chunk.strip():  # Only add non-empty chunks
                    result.append(
                        {"content": chunk.strip(), "token_count": self.count_tokens(chunk)}
                    )

            logger.info(
                f"Split text into {len(result)} chunks "
                f"(max {max_tokens} tokens, overlap {overlap_tokens})"
            )

            return result

        except ImportError:
            logger.error("langchain not installed. Cannot split text into chunks.")
            # Fallback: simple splitting
            return self._simple_chunk_text(text, max_tokens)
        except Exception as e:
            logger.error(f"Error chunking text: {e}")
            raise

    def _simple_chunk_text(self, text: str, max_tokens: int) -> List[Dict]:
        """
        Simple fallback chunking method without langchain.

        Args:
            text: Text to split
            max_tokens: Maximum tokens per chunk

        Returns:
            List of dictionaries with content and token_count
        """
        # Simple splitting by paragraphs
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""
        current_tokens = 0

        for para in paragraphs:
            para_tokens = self.count_tokens(para)

            if current_tokens + para_tokens > max_tokens and current_chunk:
                # Save current chunk and start new one
                chunks.append(
                    {
                        "content": current_chunk.strip(),
                        "token_count": current_tokens,
                    }
                )
                current_chunk = para
                current_tokens = para_tokens
            else:
                current_chunk += "\n\n" + para if current_chunk else para
                current_tokens += para_tokens

        # Add remaining chunk
        if current_chunk:
            chunks.append(
                {"content": current_chunk.strip(), "token_count": current_tokens}
            )

        logger.info(f"Simple chunking created {len(chunks)} chunks")
        return chunks

    def process_file(
        self,
        file_path: str,
        file_type: str,
        max_chunk_tokens: int = 500,
        overlap_tokens: int = 50,
    ) -> List[Dict]:
        """
        Process a file and return chunks with metadata.

        Args:
            file_path: Path to the file
            file_type: Type of file (pdf, docx, txt)
            max_chunk_tokens: Maximum tokens per chunk
            overlap_tokens: Overlap tokens between chunks

        Returns:
            List of dictionaries with content, token_count, page_number, page_total
        """
        logger.info(
            f"Processing {file_type} file: {file_path} "
            f"(max {max_chunk_tokens} tokens, overlap {overlap_tokens})"
        )

        # Extract text by pages
        if file_type.lower() == "pdf":
            pages = self.extract_text_pdf(file_path)
        elif file_type.lower() in ["docx", "doc"]:
            pages = self.extract_text_docx(file_path)
        elif file_type.lower() == "txt":
            pages = self.extract_text_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

        # Process each page into chunks
        all_chunks = []
        for page in pages:
            chunks = self.chunk_text(page["text"], max_chunk_tokens, overlap_tokens)

            for chunk in chunks:
                all_chunks.append(
                    {
                        **chunk,
                        "page_number": page["page_number"],
                        "page_total": page["page_total"],
                    }
                )

        logger.info(
            f"Processed file into {len(all_chunks)} total chunks "
            f"from {len(pages)} pages"
        )

        return all_chunks

    def estimate_file_size_tokens(self, file_path: str, file_type: str) -> int:
        """
        Estimate the token count for a file without full processing.

        Args:
            file_path: Path to the file
            file_type: Type of file (pdf, docx, txt)

        Returns:
            Estimated token count
        """
        try:
            # Quick extraction without chunking
            if file_type.lower() == "pdf":
                pages = self.extract_text_pdf(file_path)
            elif file_type.lower() in ["docx", "doc"]:
                pages = self.extract_text_docx(file_path)
            elif file_type.lower() == "txt":
                pages = self.extract_text_txt(file_path)
            else:
                # Fallback: estimate from file size
                file_size = Path(file_path).stat().st_size
                return file_size // 4  # Rough estimate

            # Count tokens in all pages
            total_text = "\n".join(page["text"] for page in pages)
            tokens = self.count_tokens(total_text)

            logger.info(f"Estimated {tokens} tokens for {file_path}")
            return tokens

        except Exception as e:
            logger.error(f"Error estimating file size: {e}")
            # Fallback to file size estimation
            try:
                file_size = Path(file_path).stat().st_size
                return file_size // 4
            except:
                return 1000  # Default estimate


# Create singleton instance
document_processor = DocumentProcessor()
