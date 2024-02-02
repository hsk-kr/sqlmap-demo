import requests
import time
import os

INTERVAL = 1  # Interval in seconds

def run_test_script_if_server_is_ready():
    while True:
      try:
          requests.get(os.environ["TEST_URL"])
          break
      except requests.exceptions.RequestException:
          time.sleep(INTERVAL)

run_test_script_if_server_is_ready()