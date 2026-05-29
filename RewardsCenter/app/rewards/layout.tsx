export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col gap-4 sm:gap-6">
      {children}
    </div>
  );
}
