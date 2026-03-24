import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Lock, Eye, FileText, CheckCircle2, UserCircle2, MonitorCheck } from 'lucide-react'

function Confetti() { 
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="confetti-particle bg-red-400" style={{ '--dx': '30px', '--dy': '-40px' } as any}></div>
      <div className="confetti-particle bg-blue-400" style={{ '--dx': '-35px', '--dy': '-20px' } as any}></div>
      <div className="confetti-particle bg-yellow-400" style={{ '--dx': '20px', '--dy': '35px' } as any}></div>
      <div className="confetti-particle bg-emerald-400" style={{ '--dx': '-25px', '--dy': '25px' } as any}></div>
      <div className="confetti-particle bg-pink-400" style={{ '--dx': '10px', '--dy': '-45px' } as any}></div>
      <div className="confetti-particle bg-purple-400" style={{ '--dx': '-10px', '--dy': '40px' } as any}></div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f6f0] relative">

      {/* Global Watermark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex flex-col justify-around z-0 opacity-[0.03]">
        <div className="animate-watermark text-[8rem] font-black text-emerald-950 select-none">
          {'TRANSACTION HUB • '.repeat(10)}
        </div>
        <div className="animate-watermark-reverse text-[8rem] font-black text-emerald-950 select-none">
          {'CHECKS ISSUED REPORTS • '.repeat(10)}
        </div>
        <div className="animate-watermark text-[8rem] font-black text-emerald-950 select-none">
          {'EFFICIENT & SECURE • '.repeat(10)}
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full px-8 py-6 flex justify-between items-center">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              T
            </div>

            <span className="text-2xl md:text-3xl font-semibold text-emerald-900 tracking-tight">
              Report of Checks Issued
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-6">

            <div className="flex items-center gap-4">

              {/* Logo 4 */}
              <div className="group w-16 h-16 [perspective:1000px] cursor-pointer">
                <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg hover:shadow-2xl rounded-full hover:-translate-y-1">

                  {/* Front Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden [backface-visibility:hidden] bg-white">
                    <Image src="/logos/logo4.png" alt="Logo 4" width={64} height={64} className="object-cover w-full h-full" />
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white">
                    <Confetti />
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src="/logos/logo-back1.jpg"
                        alt="Logo 4 Back"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo 3 */}
              <div className="group w-16 h-16 [perspective:1000px] cursor-pointer">
                <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg hover:shadow-2xl rounded-full hover:-translate-y-1">

                  {/* Front Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden [backface-visibility:hidden] bg-white">
                    <Image src="/logos/logo3.jpg" alt="Logo 3" width={64} height={64} className="object-cover w-full h-full" />
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white">
                    <Confetti />
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src="/logos/logo-back2.jpg"
                        alt="Logo 3 Back"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo 1 */}
              <div className="group w-16 h-16 [perspective:1000px] cursor-pointer">
                <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg hover:shadow-2xl rounded-full hover:-translate-y-1">

                  {/* Front Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden [backface-visibility:hidden] bg-white">
                    <Image src="/logos/logo1.jpg" alt="Logo 1" width={64} height={64} className="object-cover w-full h-full" />
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white">
                    <Confetti />
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src="/logos/logo-back3.jpg"
                        alt="Logo 1 Back"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo 2 */}
              <div className="group w-16 h-16 [perspective:1000px] cursor-pointer">
                <div className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-lg hover:shadow-2xl rounded-full hover:-translate-y-1">

                  {/* Front Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden [backface-visibility:hidden] bg-white flex items-center justify-center">
                    <Image src="/logos/logo2.png" alt="Logo 2" width={100} height={100} className="object-contain" />
                  </div>

                  {/* Back Face */}
                  <div className="absolute inset-0 w-full h-full rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white">
                    <Confetti />
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src="/logos/logo-back4.jpg"
                        alt="Logo 2 Back"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <Link href="/auth/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-base font-semibold shadow-md">
                Login
              </Button>
            </Link>

          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full py-32 text-center overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.jpg')" }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white backdrop-blur-sm" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8">

          <h1 className="text-5xl md:text-6xl font-bold text-emerald-900 leading-tight tracking-tight">
            Checked & Issued Reports System
          </h1>

          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Track, review, and manage all checked and issued items in one place. Generate accurate reports and monitor transaction history with real-time updates.
          </p>

          <Link href="/auth/login" className="inline-block mt-4">
            <div className="relative inline-flex overflow-hidden rounded-[16px] p-[3px] shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)] transition-shadow">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_30%,#10b981_70%,#a7f3d0_100%)]" />
              <span className="relative inline-flex h-full w-full items-center justify-center rounded-[13px] bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8 py-4 text-lg font-bold transition-colors">
                Login Now <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-28">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 tracking-tight">
              Designed for Efficiency
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored interfaces for different roles to streamline your workflow and ensure data accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">

            {/* Entry User Card */}
            <Card className="border-emerald-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group bg-white">
              <div className="h-2 w-full bg-emerald-600" />

              <CardHeader className="pb-4 pt-8 px-8">

                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm border border-emerald-100">
                  <FileText className="w-7 h-7 text-emerald-600" />
                </div>

                <CardTitle className="text-2xl text-emerald-950 font-bold">
                  Data Entry User
                </CardTitle>

                <CardDescription className="text-base mt-2">
                  Specialized interface to input and manage transaction data securely.
                </CardDescription>

              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-6 text-gray-700">

                <div className="space-y-4">

                  <h4 className="font-semibold text-gray-900 border-b border-emerald-50 pb-2">
                    Key Data Entry Capabilities
                  </h4>

                  <ul className="space-y-3">

                    {[
                      'Bank name, payee, and complete address',
                      'DV number and detailed particulars',
                      'Precise amounts, dates, and account codes',
                      'Comprehensive debit/credit information',
                      'Control numbers and additional remarks'
                    ].map((item, i) => (

                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-gray-600 leading-snug">{item}</span>
                      </li>

                    ))}

                  </ul>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mt-6 group-hover:bg-emerald-50 transition-colors">
                  <p className="text-sm font-medium text-emerald-900 text-center">
                    Secure and organized data management with comprehensive validation.
                  </p>
                </div>

              </CardContent>
            </Card>

            {/* Viewer Card */}
            <Card className="border-emerald-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group bg-white">
              <div className="h-2 w-full bg-emerald-500" />

              <CardHeader className="pb-4 pt-8 px-8">

                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-300 shadow-sm border border-emerald-100">
                  <Eye className="w-7 h-7 text-emerald-600" />
                </div>

                <CardTitle className="text-2xl text-emerald-950 font-bold">
                  Viewer User
                </CardTitle>

                <CardDescription className="text-base mt-2">
                  Powerful tools to access, analyze, and report transaction records.
                </CardDescription>

              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-6 text-gray-700">

                <div className="space-y-4">

                  <h4 className="font-semibold text-gray-900 border-b border-emerald-50 pb-2">
                    Analysis & Filtering Tools
                  </h4>

                  <ul className="space-y-3">

                    {[
                      'Instant access to all transaction data',
                      'Dynamic sorting by bank name and fund',
                      'Chronological sorting by date',
                      'Categorized sorting by account code',
                      'Real-time data synchronization'
                    ].map((item, i) => (

                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-gray-600 leading-snug">{item}</span>
                      </li>

                    ))}

                  </ul>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 mt-6 group-hover:bg-emerald-50 transition-colors">
                  <p className="text-sm font-medium text-emerald-900 text-center">
                    Advanced reporting capabilities for better decision making.
                  </p>
                </div>

              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2026 Transaction Hub. Built for modern financial workflows.</p>
        </div>
      </footer>

    </div>
  )
}