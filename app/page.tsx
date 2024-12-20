'use client'
import { motion } from 'framer-motion'
import React, {useEffect} from 'react'
import Navbar from './components/Navbar'
import { useRouter } from 'next/navigation'
import { BsFlower1 } from 'react-icons/bs'

function Home() {
  const router = useRouter();
  useEffect(() => {
    fetch("https://ai-therapist-backend-7rre.onrender.com/health-check", {
      method: "GET",
      headers:{
        "Content-Type": "application/json",
      }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }, []);
  return ( 
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-6 py-24 -translate-y-8 relative"
      >
        {/* Decorative circles */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute top-12 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30"
        />
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-24 left-10 w-48 h-48 bg-purple-100 rounded-full blur-3xl opacity-30"
        />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* SVG Section - Now First */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative order-2 md:order-1"
          >
            {/* Hero SVG */}
            <svg className="w-full h-auto -translate-y-16" viewBox="100 0 500 500" fill="none">
              <image href="./walk.svg" width="500" height="500" />
            </svg>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-10 right-44"
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="#3B82F6">
                <path d="M30 0L37.3205 22.6795L60 30L37.3205 37.3205L30 60L22.6795 37.3205L0 30L22.6795 22.6795L30 0Z"/>
              </svg>
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-10 left-10"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="#60A5FA">
                <circle cx="20" cy="20" r="20"/>
              </svg>
            </motion.div>
          </motion.div>

          {/* Text Content - Now Second */}
          <div className="text-left order-1 md:order-2">
            <motion.h1 
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-800 mb-8"
            >
              Your Personal
              <span className=" text-[rgb(84,138,220)] "> AI Therapist</span>
            </motion.h1>
            <motion.p 
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-xl text-gray-600 mb-12"
            >
              Experience compassionate care through our intelligent chatbot, available 24/7 to support your mental well-being.
            </motion.p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/pages/chat')}
              className="bg-[rgb(84,138,220)] text-[rgb(241,255,39)] px-8 py-3 rounded-full text-xl font-semibold flex items-center hover:bg-blue-400"
            >
           <BsFlower1 size={24} className='mr-2'/>   Start Chatting
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                title: "Real-time Chat Interface",
                description: "Engage in seamless conversations with instant responses and emotion recognition.",
                icon: "💬"
              },
              {
                title: "Chat History",
                description: "Track your progress and revisit previous conversations for better insights.",
                icon: "📝"
              },
              {
                title: "Email Notifications",
                description: "Stay connected with timely updates and session reminders.",
                icon: "📧"
              },
              {
                title: "Breathing Exercises",
                description: "Interactive animations to guide you through calming breathing techniques.",
                icon: "🫁"
              },
              {
                title: "Mood Music",
                description: "Customize your therapy experience with mood-based background music.",
                icon: "🎵"
              },
              {
                title: "24/7 Support",
                description: "Access therapeutic support whenever you need it, day or night.",
                icon: "⏰"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-blue-50 p-8 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-gradient-to-t font-semibold from-[rgb(146,172,232)] to-[rgb(160,193,243)] text-[rgb(252,255,63)] py-20"
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Start Your Journey?</h2>
          <p className="text-md  text-nowrap text-gray-800 font-medium mb-12 max-w-2xl mx-auto">
            Join thousands of others who have found peace and support through our AI therapy companion.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={()=> router.push('/pages/chat')}
            className="bg-[rgb(160,193,243)] text-[rgb(241,255,39)] px-8 py-3 rounded-full text-lg font-semibold hover:bg-[rgb(241,255,39)] hover:text-[rgb(160,193,243)]"
          >
            Begin Your First Session
          </motion.button>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
