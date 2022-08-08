import app from "./server";

import Database from "./db/Database";

async function main(): Promise<void> {
    const port: number = parseInt(process.env.PORT!) || 8000;
    try {
        StartDatabase();
        app.listen(port, () => {
            console.log("- Server is running on port:" + port);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

function StartDatabase(): void {
    Database.getDatabase();
}

main().catch(console.error);
