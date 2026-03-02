import { spawn } from "child_process";
import ngrok from "@ngrok/ngrok";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.NGROK_PORT || 8000;
const NGROK_TOKEN = process.env.NGROK_AUTHTOKEN ?? "";

const nest = spawn("bun", ["run", "start"], {
	stdio: "inherit",
	shell: true,
	env: { ...process.env, PORT: PORT },
});

nest.on("error", (err) => {
	console.error("Eror:", err.message);
	process.exit(1);
});

async function startNgrok() {
	await new Promise((resolve) => setTimeout(resolve, 5000));

	try {
		const listener = await ngrok.forward({
			addr: PORT,
			authtoken: NGROK_TOKEN,
		});

		const ngrokUrl = listener.url();
		console.log(`http://localhost:${PORT}/docs`);
		console.log(`${ngrokUrl}/docs`);
	} catch (err) {
		console.error("Error:", err.message);
	}
}
startNgrok();
process.on("SIGINT", async () => {
	nest.kill();
	await ngrok.disconnect();
	process.exit(0);
});
