"use client"
import Image from "next/image";
import Navbar from "./components/Navbar";
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "./components/Dashboard";
import { FaGithub, FaClipboardList, FaTruck, FaChartBar,FaLinkedin, FaTwitter, FaCode, FaServer, FaMobile, FaGoogle } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";



export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="md:w-1/2">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              MilkMate
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Automate your milk delivery and billing with ease — perfect for dairy businesses.
            </p>

            {/* Quick Highlights */}
            <ul className="mb-8 space-y-2 text-gray-700">
              <li className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                Automatic invoice generation
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                Daily delivery scheduling & tracking
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                Smart dashboard for dairy insights
              </li>
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => signIn("google")}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              <FaGoogle className="mr-2" />
              Get Started with Google
              <FiArrowRight className="ml-2" />
            </button>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2">
            <Image
              src="/image.png"
              alt="Dashboard Overview"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What MilkMate Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 text-4xl mb-4">
                <FaClipboardList />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Billing</h3>
              <p className="text-gray-600">
                Generate accurate, downloadable invoices for all your milk deliveries—effortlessly and on time.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 text-4xl mb-4">
                <FaTruck />
              </div>
              <h3 className="text-xl font-semibold mb-2">Delivery Management</h3>
              <p className="text-gray-600">
                Track and manage daily milk deliveries with ease.Monitor status, and notify customers.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-blue-600 text-4xl mb-4">
                <FaChartBar />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer & Inventory Insights</h3>
              <p className="text-gray-600">
                Stay on top of orders, inventory, and customer preferences with intuitive dashboards and reports.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🥛 How does MilkMate help manage milk deliveries?
              </h3>
              <p className="text-gray-600">
                MilkMate lets you track, and manage daily deliveries for each customer. You can also view delivery status in real time.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                📄 Can I generate and download customer bills?
              </h3>
              <p className="text-gray-600">
                Yes! MilkMate automatically generates invoices based on delivery records. You can view, download, or print them anytime.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🧾 Is there a dashboard to track Customers and Sales?
              </h3>
              <p className="text-gray-600">
                Absolutely. The dashboard gives you a snapshot of Total customers , settled bills , total sale and many more for better decision-making.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🔐 Do I need an account to use MilkMate?
              </h3>
              <p className="text-gray-600">
                Yes, you can sign in using your Google account to access and manage your dairy dashboard securely.
              </p>
            </div>
          </div>
        </div>
      </section>


     

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} MilkMate. All rights reserved.</p>
        </div>
        <div className="max-w-6xl mt-2 mx-auto px-4 text-center">
          <p>Developed by Vaibhav Khapra</p>
        </div>
      </footer>
    </div>
  );
}