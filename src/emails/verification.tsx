import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";


const Verification = ({ firstName, lastName, code }: Record<"firstName" | "lastName" | "code", string>) => {
	const baseUrl = process.env["CLIENT_DOMAIN"]!;
	const name = `${firstName} ${lastName}`;

	return (
		<Html lang="en">
			<Head />
			<Preview>Verify your email!</Preview>
			<Tailwind>
				<Body className="bg-slate-50 py-10">
					<Container className="bg-white border border-slate-200 rounded-lg p-8 mx-auto max-w-[600px]">
						{/* Header / Logo */}
						<Section className="mb-8 text-center">
							<Img
							src={`${baseUrl}/assets/logo.jpeg`}
							width="140"
							height="auto"
							alt="Passion Shines Logo"
							className="mx-auto"
							/>
						</Section>

						{/* Body */}
						<Heading className="text-xl font-bold text-slate-900 text-center">
							Hello, {name}!
						</Heading>

						<Section className="text-center mt-4">
							<Text className="text-slate-600 text-base leading-relaxed mt-4">
								Your verification code is:
							</Text>
							{/* Visual emphasis on the code */}
							<Text className="text-3xl font-mono font-bold tracking-widest text-indigo-600 py-4 bg-slate-50 rounded border border-dashed border-slate-200">
								{code}
							</Text>
							<Text className="text-slate-500 text-sm mt-2">
								This code will expire in 10 minutes.
							</Text>
						</Section>

						{/* Note of warning */}
						<Section className="bg-slate-50 rounded-lg p-6 my-6 border border-slate-100">
							<Text className="text-xs font-semibold text-slate-500 uppercase tracking-tight text-center m-0">
								Ignore this if you didn't register on our platform.
							</Text>
						</Section>

						{/* Footer */}
						<Hr className="border-slate-200 my-10" />
						<Section className="text-center">
							<Text className="text-slate-400 text-xs leading-5">
								**Shifts Management Team** <br />
								123 Business Way, Tech City <br />
								<Link href={baseUrl} className="text-indigo-500 underline">
									www.passionshines.com
								</Link>
							</Text>

							{/* No-Reply Notice */}
							<Section className="bg-amber-50 rounded p-2 mt-4 border border-amber-100">
								<Text className="text-amber-700 text-[11px] m-0 italic">
									Note: This is an automated message. Please do not reply to this email. For support, please contact the management directly.
								</Text>
							</Section>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default Verification;