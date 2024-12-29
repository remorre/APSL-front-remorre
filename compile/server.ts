import express from 'express';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const port = 8888;

app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:5174'],
	}),
);

app.use(bodyParser.json());

app.post('/compile', async (req: any, res: any) => {
	const { dealer, customer } = req.body;

	if (!dealer || !customer) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	// Создание папки и файла contract.tact
	const sourcesPath = path.join(__dirname, 'sources');
	const outputPath = path.join(sourcesPath, 'temp');
	const contractPath = path.join(outputPath, 'contract.tact');

	fs.mkdirSync(outputPath, { recursive: true });
	fs.writeFileSync(
		contractPath,
		`import \"@stdlib/deploy\";\n\ncontract TactApsl with Deployable {\n    PaymentNum: Int as uint8;\n    EndNum: Int as uint8;\n    customerAmount: Int as coins;  \n    dealerGuarantee: Int as coins; \n    owner: Address = address(\"UQCvpZAXC3sFrBY9yJ3rNXtEBvgF9mgwZLtlHIPwr4g_4-OR\");\n    dealer: Address = address(\"${dealer}\");\n    customer: Address = address(\"${customer}\");\n\n    init() {\n        self.PaymentNum = 0;\n        self.EndNum = 0;\n        self.customerAmount = 0;  \n        self.dealerGuarantee = 0; \n    }\n\n    receive(\"Payment\") {\n        if (sender() == self.dealer) {\n            self.PaymentNum = self.PaymentNum + 1;\n            self.dealerGuarantee = myBalance() - self.customerAmount;\n        } else if (sender() == self.customer) {\n            self.PaymentNum = self.PaymentNum + 1;\n            self.customerAmount = myBalance() - self.dealerGuarantee;\n        } else {dump(\"Access denied\")}}\n\n    receive(\"End\") {\n        if (sender() == self.dealer) {\n            self.EndNum = self.EndNum + 1;\n        } else if (sender() == self.customer) {\n            self.EndNum = self.EndNum + 1;\n        } else {dump(\"Access denied\")}\n\n        if (self.EndNum == 2) {\n            send(SendParameters{\n            to: self.dealer,\n            bounce: true,\n            value: self.dealerGuarantee + (self.customerAmount - (self.customerAmount / 20)) - context().value,\n            mode: SendRemainingValue + SendIgnoreErrors\n            });\n\n            send(SendParameters{\n            to: self.owner,\n            bounce: true,\n            value: 0,\n            mode: SendRemainingBalance + SendIgnoreErrors\n            })\n        }\n    }\n}`,
	);

	// Запуск билда
	exec(
		`yarn tact --config ./tact.config.json`,
		{ cwd: __dirname },
		async (error, stdout, stderr) => {
			if (error) {
				console.error(`Error during compilation: ${stderr}`);
				return res.status(500).json({ error: 'Compilation failed' });
			}

			try {
				// Динамический импорт модуля
				const modulePath = `./sources/temp/output/APSL_TactApsl.ts`;
				const { TactApsl } = await import(modulePath);

				const initResult = await TactApsl.init();

				const result = () => {
					return {
						code: initResult.code.toBoc().toString('base64'),
						data: initResult.data.toBoc().toString('base64'),
					};
				};
				const m = result();
				console.log(m);
				res.json(m);
				fs.rm(sourcesPath, { recursive: true, force: true }, err => {
					if (err) {
						console.error('Error deleting sources folder:', err);
					} else {
						console.log('Sources folder deleted successfully');
					}
				});
			} catch (importError) {
				console.error(`Error importing module: ${importError}`);
				res.status(500).json({ error: 'Failed to import module' });
			}
		},
	);
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
