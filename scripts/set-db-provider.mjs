#!/usr/bin/env node
// Rewrites the `provider` line of prisma/schema.prisma to match the database
// referenced by DATABASE_URL.
//
// SQLite remains the zero-config default: when DATABASE_URL is unset, or
// starts with `file:`, the schema is (re)written to use the "sqlite"
// provider. When DATABASE_URL starts with `postgres://` or `postgresql://`,
// the schema is rewritten to use the "postgresql" provider.
//
// This script is idempotent - it can be run any number of times and will
// simply leave the schema unchanged if it already matches. It is intended to
// run at build/deploy time (see entrypoint.sh), never during normal
// development, since the schema.prisma checked into git always defaults to
// "sqlite".

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.resolve(__dirname, "../prisma/schema.prisma");

function detectProvider(databaseUrl) {
    if (databaseUrl && /^postgres(ql)?:\/\//i.test(databaseUrl)) {
        return "postgresql";
    }

    return "sqlite";
}

function setProvider(schemaContents, provider) {
    // Only touch the `provider` line inside the `datasource` block - the
    // `generator` block also has a `provider` field ("prisma-client") that
    // must be left untouched.
    const datasourceBlockRegex = /(datasource\s+\w+\s*\{)([\s\S]*?)(\n\})/;
    const match = schemaContents.match(datasourceBlockRegex);

    if (!match) {
        throw new Error(`Could not find a "datasource" block in ${SCHEMA_PATH}`);
    }

    const providerLineRegex = /(\s*provider\s*=\s*)"[^"]*"(\s*)/;
    const [, blockOpen, blockBody, blockClose] = match;

    if (!providerLineRegex.test(blockBody)) {
        throw new Error(`Could not find a "provider" line in the datasource block of ${SCHEMA_PATH}`);
    }

    const updatedBlockBody = blockBody.replace(providerLineRegex, `$1"${provider}"$2`);

    return schemaContents.replace(datasourceBlockRegex, () => `${blockOpen}${updatedBlockBody}${blockClose}`);
}

function main() {
    const provider = detectProvider(process.env.DATABASE_URL);
    const schemaContents = readFileSync(SCHEMA_PATH, "utf8");
    const updatedSchemaContents = setProvider(schemaContents, provider);

    if (updatedSchemaContents === schemaContents) {
        console.log(`prisma/schema.prisma already uses provider "${provider}"`);
        return;
    }

    writeFileSync(SCHEMA_PATH, updatedSchemaContents);
    console.log(`Set prisma/schema.prisma provider to "${provider}"`);
}

main();
