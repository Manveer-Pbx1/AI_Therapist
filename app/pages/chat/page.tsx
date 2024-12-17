'use client'
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import axios from "axios";
import { motion } from "framer-motion";
import { IoPaperPlaneOutline, IoArrowBack, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import ChatContainer from "../../components/ChatContainer";
import { useSession } from "next-auth/react";
import VoiceChat from "../../components/VoiceChat";
import { RiVoiceAiFill } from "react-icons/ri";
import { useMusic } from '../../context/MusicContext';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  isNew?: boolean;  // Add this property
}

export default function Chat() {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const {data: session} = useSession();
  const username = session?.user?.name;
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setEmotion } = useMusic();

  useEffect(() => {
    if (session?.user?.name) {
      setMessages([
        { 
          id: '1', 
          content: `Hello ${session.user.name.split(" ")[0]}! How can I help you today?`, 
          isBot: true 
        }
      ]);
    }
  }, [session]);

  useEffect(() => {
    console.log("Session user id:", session?.user.id);
    console.log("Session user name:", session?.user.name);
}, [session]);

  const cleanupVoiceRecognition = () => {
    if (recognitionRef.current) {
      // Remove all event listeners
      recognitionRef.current.onaudiostart = null;
      recognitionRef.current.onaudioend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      
      // Stop and abort recognition
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clear timeouts
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (showVoiceChat && typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Keep listening
        recognitionRef.current.interimResults = true; // Get real-time results
        recognitionRef.current.lang = 'en-US';

        let finalTranscript = '';
        let isProcessing = false;

        recognitionRef.current.onaudiostart = () => {
          setIsUserSpeaking(true);
          // Pause bot's speech when user starts speaking
          if (isSpeaking) {
            window.speechSynthesis.pause();
          }
        };

        recognitionRef.current.onaudioend = () => {
          // Clear any existing timeout
          if (speechTimeoutRef.current) {
            clearTimeout(speechTimeoutRef.current);
          }
          // Set a small delay before marking user as done speaking
          speechTimeoutRef.current = setTimeout(() => {
            setIsUserSpeaking(false);
            // Resume bot's speech if it was interrupted
            if (isSpeaking) {
              window.speechSynthesis.resume();
            }
          }, 1000);
        };

        recognitionRef.current.onresult = async (event: any) => {
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript = transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          // If we detect substantial user speech, cancel current bot speech
          if (interimTranscript.length > 5) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
          }

          // Only process final results and avoid duplicate processing
          if (finalTranscript && !isProcessing) {
            isProcessing = true;
            
            setUserInput(finalTranscript);
            setMessages(prev => [...prev, { 
              id: Date.now().toString(), 
              content: finalTranscript, 
              isBot: false 
            }]);

            setIsTyping(true);
            try {
              const response = await axios.post("https://ai-therapist-pi.vercel.app/api/therapy-chat", {
                input: finalTranscript,
                user_id: session?.user.id || "anonymous"
              });
              
              console.log("Voice response data:", response.data);

              // Handle emotion for voice input
              if (response.data.emotion) {
                const emotion = response.data.emotion.toLowerCase();
                console.log("Setting emotion from voice input:", emotion);
                setEmotion(emotion);
              }

              const botMessage = { 
                id: Date.now().toString(), 
                content: response.data.response, 
                isBot: true 
              };

              setMessages(prev => [...prev, botMessage]);
              
              if (voiceMode) {
                speakText(botMessage.content);
              }
            } catch (error) {
              console.error("Error:", error);
            } finally {
              setIsTyping(false);
              setUserInput("");
              finalTranscript = '';
              isProcessing = false;
            }
          }
        };

        recognitionRef.current.onend = () => {
          // Always restart recognition in voice mode
          if (showVoiceChat) {
            recognitionRef.current.start();
          }
        };

        recognitionRef.current.start();
        setIsRecording(true);
      }
    }

    return () => {
      cleanupVoiceRecognition();
      setIsRecording(false);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
    };
  }, [showVoiceChat]);

  const speakText = (text: string) => {
    if (!voiceMode || isUserSpeaking) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-UK';
    utterance.rate = 1.85;
    utterance.pitch = 1.55;
    
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(voice => voice.lang === 'en-UK') || voices[0];
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      // Don't stop recognition while speaking
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onpause = () => {
      setIsSpeaking(true); // Keep speaking state true while paused
    };
    
    utterance.onresume = () => {
      setIsSpeaking(true);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        // Start new recording session
        recognitionRef.current.abort(); // Clear any existing session
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsRecording(false);
    }
  };

  const handleCloseVoiceChat = () => {
    cleanupVoiceRecognition();
    
    // Reset all states
    setShowVoiceChat(false);
    setVoiceMode(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setIsUserSpeaking(false);
  };

  useEffect(() => {
    const loadPreviousChat = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get(`/api/chat?userId=${session.user.id}`);
          if (response.data.success && response.data.chats.length > 0) {
            // Load messages without isNew flag
            setMessages(response.data.chats[0].messages.map((msg: any) => ({
              ...msg,
              isNew: false
            })));
          }
        } catch (error) {
          console.error("Error loading previous chat:", error);
        }
      }
    };

    loadPreviousChat();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { 
      id: Date.now().toString(), 
      content: userInput, 
      isBot: false,
      isNew: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    try {
      console.log("Sending request with input:", userInput.trim());
      const response = await axios.post("/api/therapy-chat", {
        input: userInput.trim(),
        user_id: session?.user?.id || "anonymous"
      });
      
      // Add detailed response logging
      console.log("Raw API response:", response);
      console.log("Response data:", response.data);
      console.log("Emotion from response:", response.data.emotion);

      if (response.data.emotion) {
        const emotion = response.data.emotion.toLowerCase();
        console.log("Setting emotion to:", emotion);
        setEmotion(emotion);
      } else {
        console.warn("No emotion detected in response:", response.data);
      }

      // Ensure response.data.response is a string
      const botResponse = typeof response.data.response === 'string' 
        ? response.data.response 
        : JSON.stringify(response.data.response);

      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        content: botResponse,
        isBot: true,
        isNew: true
      };

      setMessages(prev => [...prev, botMessage]);

      // Save the updated chat to database
      if (session?.user?.id) {
        await axios.post("/api/chat", {
          userId: session.user.id,
          messages: [...messages, userMessage, botMessage].map(msg => ({
            content: msg.content,
            isBot: msg.isBot,
            timestamp: new Date()
          }))
        });
      }
      
      if (voiceMode) {
        speakText(botMessage.content);
      }
      
      setUserInput("");
    } catch (error) {
      console.error("Error with full details:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        content: "Sorry, I encountered an error. Please try again.", 
        isBot: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStopVoiceChat = () => {
    cleanupVoiceRecognition();
    
    // Reset all states
    setShowVoiceChat(false);
    setVoiceMode(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setIsUserSpeaking(false);
  };

  const handleVoiceModeToggle = () => {
    setShowVoiceChat(prev => !prev);
    setVoiceMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col relative w-full">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <IoArrowBack size={24} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {session?.user ? (
              <img src={session.user.image || ""} alt={session.user.name || ""} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <FaUser size={28} />
            )}
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] w-full">
        <div className="flex-1 w-full relative">
          <ChatContainer messages={messages} isTyping={isTyping} />
        
          {/* Move VoiceChat here so it appears above the chat but below the form */}
          {showVoiceChat && (
            <VoiceChat 
              isRecording={isRecording}
              isSpeaking={isSpeaking}
              isTyping={isTyping} // Pass isTyping state
              onToggleRecording={toggleRecording}
              onStop={handleStopVoiceChat}
              onClose={handleCloseVoiceChat}
            />
          )}
        </div>
        
        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={handleSubmit}
          className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white shadow-lg w-full"
        >
          <div className="container mx-auto px-4">
            <div className="flex gap-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tell me what's on your mind..."
                className="flex-1 resize-none border rounded-full py-4 px-8 focus:outline-none h-12 max-h-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (userInput.trim()) {
                      handleSubmit(e);
                    }
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleVoiceModeToggle}
                className="bg-[rgb(132,181,255)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
              >
                <RiVoiceAiFill size={28} className="text-[rgb(241,255,39)]"/>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-[rgb(132,181,255)] text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600"
              >
                <IoPaperPlaneOutline size={28} className="text-[rgb(241,255,39)]"/>
              </motion.button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}