import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex flex-col py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 pt-8">
          Meeting Cost Calculator
        </h1>
        <p className="text-white/60 mb-16 text-center max-w-lg text-lg">
          See the true cost of your meetings in real-time. Make every minute count.
        </p>
        
        <Calculator />
      </div>
    </main>
  );
}
