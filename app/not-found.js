// app/not-found.js
import Link from 'next/link'
import Navbar from './components/Navbar'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
            <Navbar />
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6">
                    {/* Milky Way 404 */}
                    <div className="animate-float">
                        <span className="text-8xl text-white font-bold  bg-clip-text bg-gradient-to-r from-milkmate-blue to-milkmate-light">
                            404
                        </span>
                    </div>

                    {/* Branded Messaging */}
                    <h1 className="text-3xl font-semibold text-gray-100">
                       Page Not found!
                    </h1>
                    <p className="text-lg text-gray-300">
                        You have entered a wrong URL
                    </p>

                    {/* Milky Return Button */}
                    <div className="pt-4 ">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-milkmate-blue/20 transition-all duration-300"
                        >
                            <span>Back to the Milkmate</span>
                            <span className="text-xl">🥛</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}