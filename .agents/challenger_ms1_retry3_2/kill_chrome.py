import subprocess
import os
import signal
import sys

def main():
    print("Querying chrome.exe processes...")
    try:
        # Run wmic to get command line and process ID
        out = subprocess.run(
            ['wmic', 'process', 'where', "name='chrome.exe'", 'get', 'CommandLine,ProcessId'],
            capture_output=True,
            text=True,
            shell=True
        ).stdout
    except Exception as e:
        print(f"Error running wmic: {e}")
        return

    lines = out.strip().splitlines()
    if not lines or len(lines) <= 1:
        print("No chrome.exe processes found.")
        return

    killed_count = 0
    # Process headers
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
        # Split by the last token which should be the ProcessId (a sequence of digits)
        parts = line.rsplit(maxsplit=1)
        if len(parts) < 2:
            continue
        cmdline, pid_str = parts[0], parts[1]
        try:
            pid = int(pid_str)
        except ValueError:
            continue

        # We look for debugging port 9225, headless, or our temp user data dir
        if "remote-debugging-port=9225" in cmdline or "headless" in cmdline or "remote-debugging-port=9222" in cmdline:
            print(f"Killing PID {pid} running: {cmdline[:80]}...")
            try:
                os.kill(pid, signal.SIGTERM)
                killed_count += 1
            except Exception as e:
                # Try taskkill /f /pid if os.kill fails
                try:
                    subprocess.run(['taskkill', '/F', '/PID', str(pid)], capture_output=True)
                    killed_count += 1
                except Exception:
                    print(f"Failed to kill PID {pid}: {e}")

    print(f"Done. Killed {killed_count} orphaned chrome processes.")

if __name__ == '__main__':
    main()
