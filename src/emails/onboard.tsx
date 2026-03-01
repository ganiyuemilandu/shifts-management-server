import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";


const Onboard: React.FC<Record<"firstName" | "lastName", string>> = ({ firstName, lastName }) => {
	const baseUrl = process.env["CLIENT_DOMAIN"]!;
	const name = `${firstName} ${lastName}`;

	return (
		<Html lang="en">
			<Head />
			<Preview>Welcome to the team! We're glad to have you onboard.</Preview>
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
							Welcome to the team, {name}!
						</Heading>
						<Text className="text-slate-600 text-base leading-relaxed mt-4">
							Your account for the **Shift Management Portal** is now active. You can use this platform to view your schedule, accept/decline assigned shifts, and manage your availability.
						</Text>

						{/* Feature Highlights */}
						<Section className="bg-slate-50 rounded-lg p-6 my-6 border border-slate-100">
							<Text className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
								What you can do:
							</Text>
							<ul className="text-slate-600 text-sm space-y-2 pl-4">
								<li>✅ View and accept/decline new shift assignments</li>
								<li>📅 View your upcoming shifts and schedule</li>
							</ul>
						</Section>

						<Section className="text-center mt-8">
							<Button href={`${baseUrl}/login`} className="bg-blue-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
								Log in to your account
							</Button>
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

export default Onboard;