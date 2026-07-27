from django.apps import AppConfig
import threading

class JobsConfig(AppConfig):
    name = 'jobs'

    def ready(self):
        from jobs.seeder import seed_db_if_empty
        threading.Thread(target=seed_db_if_empty, daemon=True).start()
