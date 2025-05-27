"use client"
import Image from "next/image";
import Navbar from "./components/Navbar";
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "./components/Dashboard";
import { FaGithub, FaClipboardList, FaTruck, FaChartBar, FaLinkedin, FaTwitter, FaCode, FaServer, FaMobile, FaGoogle } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer, slideIn, zoomIn } from "./utils/motion";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.25 }}
        className="py-20 px-4 max-w-6xl mx-auto"
      >
        <motion.div
          variants={staggerContainer(0.1, 0.2)}
          className="flex flex-col md:flex-row items-center justify-between gap-12"
        >
          {/* Left Content */}
          <motion.div
            variants={fadeIn('right', 'tween', 0.2, 1)}
            className="md:w-1/2"
          >
            <motion.h1
              variants={fadeIn('up', 'tween', 0.2, 1)}
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              MilkMate
            </motion.h1>
            <motion.p
              variants={fadeIn('up', 'tween', 0.3, 1)}
              className="text-xl text-gray-600 mb-6"
            >
              Automate your milk delivery and billing with ease — perfect for dairy businesses.
            </motion.p>

            {/* Quick Highlights */}
            <motion.ul
              variants={staggerContainer(0.1, 0.2)}
              className="mb-8 space-y-2 text-gray-700"
            >
              <motion.li
                variants={fadeIn('up', 'tween', 0.4, 1)}
                className="flex items-center"
              >
                <FaCheckCircle className="text-green-500 mr-2" />
                Automatic invoice generation
              </motion.li>
              <motion.li
                variants={fadeIn('up', 'tween', 0.5, 1)}
                className="flex items-center"
              >
                <FaCheckCircle className="text-green-500 mr-2" />
                Daily delivery scheduling & tracking
              </motion.li>
              <motion.li
                variants={fadeIn('up', 'tween', 0.6, 1)}
                className="flex items-center"
              >
                <FaCheckCircle className="text-green-500 mr-2" />
                Smart dashboard for dairy insights
              </motion.li>
            </motion.ul>

            {/* CTA Button */}
            <motion.button
              variants={fadeIn('up', 'tween', 0.7, 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn("google")}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              <FaGoogle className="mr-2" />
              Get Started with Google
              <FiArrowRight className="ml-2" />
            </motion.button>
          </motion.div>

          {/* Right Image */}
          <motion.div
            variants={zoomIn(0.4, 1)}
            className="md:w-1/2"
          >
            <Image
              src="/image.png"
              alt="Dashboard Overview"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="py-16 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            What MilkMate Offers
          </motion.h2>
          <motion.div
            variants={staggerContainer(0.1, 0.2)}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeIn('right', 'tween', 0.2, 1)}
              whileHover={{ y: -10 }}
              className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-blue-600 text-4xl mb-4">
                <FaClipboardList />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Billing</h3>
              <p className="text-gray-600">
                Generate accurate, downloadable invoices for all your milk deliveries—effortlessly and on time.
              </p>
            </motion.div>
            <motion.div
              variants={fadeIn('up', 'tween', 0.4, 1)}
              whileHover={{ y: -10 }}
              className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-blue-600 text-4xl mb-4">
                <FaTruck />
              </div>
              <h3 className="text-xl font-semibold mb-2">Delivery Management</h3>
              <p className="text-gray-600">
                Track and manage daily milk deliveries with ease. Monitor status, and notify customers.
              </p>
            </motion.div>
            <motion.div
              variants={fadeIn('left', 'tween', 0.6, 1)}
              whileHover={{ y: -10 }}
              className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-blue-600 text-4xl mb-4">
                <FaChartBar />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer & Inventory Insights</h3>
              <p className="text-gray-600">
                Stay on top of orders, inventory, and customer preferences with intuitive dashboards and reports.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="py-16 bg-gray-100"
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            variants={fadeIn('up', 'tween', 0.2, 1)}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.div
            variants={staggerContainer(0.1, 0.2)}
            className="space-y-8"
          >
            <motion.div
              variants={fadeIn('up', 'tween', 0.3, 1)}
              whileHover={{ x: 5 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🥛 How does MilkMate help manage milk deliveries?
              </h3>
              <p className="text-gray-600">
                MilkMate lets you track, and manage daily deliveries for each customer. You can also view delivery status in real time.
              </p>
            </motion.div>
            <motion.div
              variants={fadeIn('up', 'tween', 0.4, 1)}
              whileHover={{ x: 5 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                📄 Can I generate and download customer bills?
              </h3>
              <p className="text-gray-600">
                Yes! MilkMate automatically generates invoices based on delivery records. You can view, download, or print them anytime.
              </p>
            </motion.div>
            <motion.div
              variants={fadeIn('up', 'tween', 0.5, 1)}
              whileHover={{ x: 5 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🧾 Is there a dashboard to track Customers and Sales?
              </h3>
              <p className="text-gray-600">
                Absolutely. The dashboard gives you a snapshot of Total customers, settled bills, total sale and many more for better decision-making.
              </p>
            </motion.div>
            <motion.div
              variants={fadeIn('up', 'tween', 0.6, 1)}
              whileHover={{ x: 5 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                🔐 Do I need an account to use MilkMate?
              </h3>
              <p className="text-gray-600">
                Yes, you can sign in using your Google account to access and manage your dairy dashboard securely.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="bg-gray-900 text-white py-8"
      >
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 1)}
          className="max-w-6xl mx-auto px-4 text-center"
        >
          <p>© {new Date().getFullYear()} MilkMate. All rights reserved.</p>
        </motion.div>
        <motion.div
          variants={fadeIn('up', 'tween', 0.3, 1)}
          className="max-w-6xl mt-2 mx-auto px-4 text-center"
        >
          <p>Developed by Vaibhav Khapra</p>
        </motion.div>
      </motion.footer>
    </div>
  );
}