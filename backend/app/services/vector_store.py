import logging
import time
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd
from app.core.config import settings
from app.services.openai_service import openai_service
from timescale_vector import client

logger = logging.getLogger(__name__)


class VectorStore:
    """A class for managing vector operations and database interactions."""

    def __init__(self):
        """Initialize the VectorStore with settings and Timescale Vector client."""
        self.vector_settings = settings.vector_store
        
        # Convert SQLAlchemy URI to format compatible with psycopg2
        # Change from postgresql+psycopg:// to postgresql://
        uri_string = settings.SQLALCHEMY_DATABASE_URI.unicode_string()
        psycopg2_uri = uri_string.replace("postgresql+psycopg://", "postgresql://")
        
        logger.info(f"Initializing vector store with table: {self.vector_settings.table_name}")
        
        try:
            self.vec_client = client.Sync(
                psycopg2_uri,
                self.vector_settings.table_name,
                self.vector_settings.embedding_dimensions,
                time_partition_interval=self.vector_settings.time_partition_interval,
            )
            logger.info("Vector store client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing vector store client: {str(e)}")
            if "dsn" in str(e).lower():
                # Show more details about the connection string (without credentials)
                sanitized_uri = psycopg2_uri.replace(psycopg2_uri.split("@")[0], "postgresql://[REDACTED]")
                logger.error(f"Connection string format issue. Using: {sanitized_uri}")
            raise

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for the given text using the OpenAI service.

        Args:
            text: The input text to generate an embedding for.

        Returns:
            A list of floats representing the embedding.
        """
        start_time = time.time()
        embedding = openai_service.get_embedding(text)
        elapsed_time = time.time() - start_time
        logger.info(f"Embedding generated in {elapsed_time:.3f} seconds")
        return embedding

    def create_tables(self) -> None:
        """Create the necessary tables in the database"""
        self.vec_client.create_tables()
        logger.info(f"Created tables for vector store: {self.vector_settings.table_name}")

    def create_index(self) -> None:
        """Create the StreamingDiskANN index to speed up similarity search"""
        self.vec_client.create_embedding_index(client.DiskAnnIndex())
        logger.info(f"Created DiskANN index for vector store: {self.vector_settings.table_name}")

    def drop_index(self) -> None:
        """Drop the StreamingDiskANN index in the database"""
        self.vec_client.drop_embedding_index()
        logger.info(f"Dropped index for vector store: {self.vector_settings.table_name}")

    def upsert(self, df: pd.DataFrame) -> None:
        """
        Insert or update records in the database from a pandas DataFrame.

        Args:
            df: A pandas DataFrame containing the data to insert or update.
                Expected columns: id, metadata, contents, embedding
        """
        records = df.to_records(index=False)
        self.vec_client.upsert(list(records))
        logger.info(f"Inserted {len(df)} records into {self.vector_settings.table_name}")

    def upsert_single(
        self,
        content: str,
        metadata: Dict[str, Any],
        id_or_time: Optional[Union[str, datetime]] = None,
        embedding: Optional[List[float]] = None,
    ) -> str:
        """
        Insert a single document into the vector store.

        Args:
            content: The text content to store
            metadata: Dictionary of metadata to store with the content
            id_or_time: Optional UUID string or datetime to use for the record
            embedding: Optional pre-computed embedding

        Returns:
            The UUID of the inserted record
        """
        # Generate UUID based on input
        if id_or_time is None:
            record_id = str(uuid.uuid4())
        elif isinstance(id_or_time, datetime):
            record_id = str(client.uuid_from_time(id_or_time))
        else:
            record_id = id_or_time

        try:
            # Get embedding if not provided
            if embedding is None:
                logger.info(f"Generating embedding for content ({len(content)} chars)")
                embedding = self.get_embedding(content)
                logger.info(f"Embedding generated successfully with {len(embedding)} dimensions")

            # Create DataFrame for upsert
            df = pd.DataFrame(
                [
                    {
                        "id": record_id,
                        "metadata": metadata,
                        "contents": content,
                        "embedding": embedding,
                    }
                ]
            )

            # Perform the upsert
            logger.info(f"Upserting vector with ID {record_id} into database")
            try:
                self.upsert(df)
                logger.info(f"Successfully upserted vector with ID {record_id}")
            except Exception as e:
                logger.error(f"Database upsert failed: {str(e)}")
                if hasattr(e, '__cause__') and e.__cause__:
                    logger.error(f"Caused by: {str(e.__cause__)}")
                raise

            return record_id
        except Exception as e:
            logger.error(f"Error in upsert_single: {str(e)}")
            raise

    def search(
        self,
        query_text: str,
        limit: int = 5,
        metadata_filter: Union[dict, List[dict]] = None,
        predicates: Optional[client.Predicates] = None,
        time_range: Optional[Tuple[datetime, datetime]] = None,
        return_dataframe: bool = True,
    ) -> Union[List[Tuple[Any, ...]], pd.DataFrame]:
        """
        Query the vector database for similar embeddings based on input text.

        Args:
            query_text: The input text to search for.
            limit: The maximum number of results to return.
            metadata_filter: A dictionary or list of dictionaries for equality-based metadata filtering.
            predicates: A Predicates object for complex metadata filtering.
            time_range: A tuple of (start_date, end_date) to filter results by time.
            return_dataframe: Whether to return results as a DataFrame (default: True).

        Returns:
            Either a list of tuples or a pandas DataFrame containing the search results.
        """
        query_embedding = self.get_embedding(query_text)

        start_time = time.time()

        search_args = {
            "limit": limit,
        }

        if metadata_filter:
            search_args["filter"] = metadata_filter

        if predicates:
            search_args["predicates"] = predicates

        if time_range:
            start_date, end_date = time_range
            search_args["uuid_time_filter"] = client.UUIDTimeRange(start_date, end_date)

        logger.info(f"Vector search started for query: {search_args}")
        results = self.vec_client.search(query_embedding, **search_args)
        elapsed_time = time.time() - start_time
        #logger.info(f"Vector search results: {results}")
        logger.info(f"Vector search completed in {elapsed_time:.3f} seconds")

        if return_dataframe:
            return self._create_dataframe_from_results(results)
        else:
            return results

    def _create_dataframe_from_results(
        self,
        results: List[Tuple[Any, ...]],
    ) -> pd.DataFrame:
        """
        Create a pandas DataFrame from the search results.

        Args:
            results: A list of tuples containing the search results.

        Returns:
            A pandas DataFrame containing the formatted search results.
        """
        # Check if results are empty
        if not results:
            return pd.DataFrame(columns=["id", "metadata", "content", "embedding", "distance"])

        # Convert results to DataFrame
        df = pd.DataFrame(
            results, columns=["id", "metadata", "content", "embedding", "distance"]
        )

        # Expand metadata column
        df = pd.concat(
            [df.drop(["metadata"], axis=1), df["metadata"].apply(pd.Series)], axis=1
        )

        # Convert id to string for better readability
        df["id"] = df["id"].astype(str)

        return df

    def delete(
        self,
        ids: List[str] = None,
        metadata_filter: dict = None,
        delete_all: bool = False,
    ) -> None:
        """
        Delete records from the vector database.

        Args:
            ids: A list of record IDs to delete.
            metadata_filter: A dictionary of metadata key-value pairs to filter records for deletion.
            delete_all: A boolean flag to delete all records.

        Raises:
            ValueError: If no deletion criteria are provided or if multiple criteria are provided.
        """
        if sum(bool(x) for x in (ids, metadata_filter, delete_all)) != 1:
            raise ValueError(
                "Provide exactly one of: ids, metadata_filter, or delete_all"
            )

        if delete_all:
            self.vec_client.delete_all()
            logger.info(f"Deleted all records from {self.vector_settings.table_name}")
        elif ids:
            self.vec_client.delete_by_ids(ids)
            logger.info(
                f"Deleted {len(ids)} records from {self.vector_settings.table_name}"
            )
        elif metadata_filter:
            self.vec_client.delete_by_metadata(metadata_filter)
            logger.info(
                f"Deleted records matching metadata filter from {self.vector_settings.table_name}"
            )

    def delete_by_analysis_id(self, analysis_id: str) -> None:
        """
        Delete all records associated with a specific analysis ID.

        Args:
            analysis_id: The analysis ID to delete records for.
        """
        self.delete(metadata_filter={"analysis_id": analysis_id})


# Create a singleton instance
vector_store = VectorStore() 