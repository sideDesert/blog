export function Main({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex justify-center w-[min(100rem,calc(100%-2*clamp(1rem,4.35vw,5rem)))] flex-wrap justify-between gap-x-4 gap-y-2   py-[0.625rem_1rem] text-sm">
      {children}
    </main>
  );
}
