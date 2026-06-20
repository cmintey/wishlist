Gotchas with removing the proxy
1. No more compression
2. ORIGIN is now not always needed. It can now be inferred from X-Forwared-For and X-Forwarded-Host *if* they are set properly on the upstream proxy
3. Port 3000 is no longer valid
4. PORT environment variable is configurable