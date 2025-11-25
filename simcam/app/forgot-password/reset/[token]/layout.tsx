export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="container mx-auto max-w-[100%] pt-16 flex-grow">
			<div className="max-w-[100%] max-h-[100%]">
				{children}
			</div>
		</section>
	);
}
