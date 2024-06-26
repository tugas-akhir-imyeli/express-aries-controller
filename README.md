# IMYELI Express Template
## How to use
1. Run `npm init`
2. Install module `npm i @prisma/client cookie-parser cors dotenv express morgan prisma-exclude sqlite3`
3. Install types `npm i --save-dev @types/cookie-parser @types/cors @types/debug @types/express @types/morgan ts-node-dev typescript`
4. Add scripts to the package.json
```
    "start": "node --experimental-specifier-resolution=node --loader ts-node/esm dist/index.js",
    "dev": "tsc-watch --onSuccess \"npm run watch\"",
    "watch": "nodemon --watch './**/*.{ts,graphql}' --exec \"node --experimental-specifier-resolution=node --loader ts-node/esm\" src/index.ts",
    "build": "tsc",
    "migrate": "npx prisma db pull && npx prisma generate",
```