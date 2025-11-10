import os
from celery import Celery
from app.core.config import settings

# Initialize Celery with the broker URL
celery_app = Celery(
    "app.worker",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        # Projects module tasks
        "app.modules.projects.tasks.document_tasks",
    ],
)

# Keep 'celery' as alias for backwards compatibility
celery = celery_app

# Configure Celery
celery.conf.update(
    task_track_started=True,
    task_time_limit=60 * 60 * 5,  # 5 hours
    worker_max_tasks_per_child=1000,
    worker_prefetch_multiplier=1,
    worker_send_task_events=True,
    broker_connection_retry_on_startup=True,
)

# Optional configuration for result expiration
celery.conf.result_expires = 60 * 60 * 24 * 7  # 7 days

# Optional configuration for scheduled tasks (if needed)
celery.conf.beat_schedule = {
    # Example of a scheduled task that runs every day at midnight
    # "cleanup-old-analysis": {
    #     "task": "app.tasks.cleanup.delete_old_analysis",
    #     "schedule": 60 * 60 * 24,  # 24 hours
    # },
}

if __name__ == "__main__":
    celery.start() 