-- Clean up the bad config
DELETE FROM system_config WHERE "key" = 'claims.showName' AND "groupId" = 'global';

-- Now conditionally add the config option
INSERT OR IGNORE INTO system_config ("key", "value", "groupId")
SELECT 'claims.showName', 'true', 'global'
WHERE (select count(*) > 0 from system_config );