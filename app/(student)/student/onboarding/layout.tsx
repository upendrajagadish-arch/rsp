export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f7fb_0%,#f7f9fc_40%,#f7f9fc_100%)] p-4 sm:p-8">
      {children}
    </div>
  );
}
