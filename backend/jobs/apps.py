from django.apps import AppConfig
import threading
import sys

class JobsConfig(AppConfig):
    name = 'jobs'

    def ready(self):
        if 'test' in sys.argv:
            return
        from jobs.seeder import seed_db_if_empty
        threading.Thread(target=seed_db_if_empty, daemon=True).start()
