from django.core.management.base import BaseCommand
from jobs.providers import sync_all_providers

class Command(BaseCommand):
    help = "Syncs and ingests jobs from multiple external providers (LinkedIn, Indeed, Naukri, etc.)"

    def handle(self, *args, **options):
        self.stdout.write("Starting job ingestion pipeline sync...")
        imported, duplicates = sync_all_providers(limit_per_provider=6)
        self.stdout.write(
            self.style.SUCCESS(
                f"Sync completed successfully. Ingested: {imported} jobs, Skipped duplicates: {duplicates}."
            )
        )
