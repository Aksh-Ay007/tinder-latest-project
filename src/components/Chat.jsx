import React, { useEffect, useState, useRef } from "react";
import { Phone, Video, Send, Smile, MoreVertical, Check, CheckCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUserName, setTargetUserName] = useState("");
  const [targetUserPhoto, setTargetUserPhoto] = useState("");
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  // Fetch chat and recipient details
  const fetchChat = async () => {
    try {
      const chat = await axios.get(`${BASE_URL}/chat/${targetUserId}`, { withCredentials: true });

      // Extract recipient details - ensure we're filtering correctly
      const recipient = chat.data.participant.find(p => p._id.toString() !== userId.toString());
      
      if (recipient) {
        setTargetUserName(`${recipient.firstName} ${recipient.lastName}`);
        setTargetUserPhoto(recipient.photoUrl);
      } else {
        console.error("Recipient not found in participants");
        // Fetch recipient directly as a fallback
        try {
          const userResponse = await axios.get(`${BASE_URL}/users/${targetUserId}`, { withCredentials: true });
          const user = userResponse.data;
          setTargetUserName(`${user.firstName} ${user.lastName}`);
          setTargetUserPhoto(user.photoUrl);
        } catch (err) {
          console.error("Failed to fetch recipient information", err);
        }
      }

      // Map messages
      const chatMessages = chat?.data?.messages.map((msg) => {
        const { _id, senderId, message, timestamp, isRead } = msg;
        return {
          _id,
          message,
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          senderId: senderId?._id,
          timestamp,
          isRead,
        };
      });
      setMessages(chatMessages);

      // Mark received messages as read
      const unreadMessageIds = chatMessages
        .filter(msg => msg.senderId === targetUserId && !msg.isRead)
        .map(msg => msg._id);
      
      if (unreadMessageIds.length > 0 && socketRef.current) {
        socketRef.current.emit("messageRead", { 
          userId, 
          targetUserId, 
          messageIds: unreadMessageIds 
        });
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  // Format the last seen time
  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return "Unknown";
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit("userTyping", { userId, targetUserId, isTyping: true });
      
      // Clear any existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set a new timeout to stop the typing indicator after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("userTyping", { userId, targetUserId, isTyping: false });
        }
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  };

  useEffect(() => {
    fetchChat();
    
    // Setup periodic ping to keep track of online status
    const pingInterval = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.emit("ping", { userId });
      }
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(pingInterval);
  }, [targetUserId]);

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    // Notify the server that user is online
    socket.emit("userOnline", { userId });

    // Join the chat room
    socket.emit("JoinChat", { firstName: user.firstName, userId, targetUserId });

    // Listen for initial online users
    socket.on("initialOnlineUsers", (onlineUserIds) => {
      if (onlineUserIds.includes(targetUserId)) {
        setIsRecipientOnline(true);
        setLastSeen(new Date());
      }
    });

    // Listen for user status updates
    socket.on("userStatusUpdate", ({ userId: updatedUserId, status, lastSeen: userLastSeen }) => {
      if (updatedUserId === targetUserId) {
        setIsRecipientOnline(status === "online");
        if (status === "offline" && userLastSeen) {
          setLastSeen(userLastSeen);
        }
      }
    });

    // Listen for incoming messages
    socket.on("receiveMessage", ({ _id, message, firstName, lastName, timestamp, isRead, senderId }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { _id, message, firstName, lastName, senderId, timestamp, isRead },
      ]);
      
      // If the message is from the target user, mark it as read
      if (senderId === targetUserId) {
        socket.emit("messageRead", { 
          userId, 
          targetUserId, 
          messageIds: [_id] 
        });
      }
    });

    // Listen for message read status updates
    socket.on("messagesReadUpdate", ({ messageIds }) => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
        )
      );
    });

    // Listen for typing status
    socket.on("typingStatus", ({ userId: typingUserId, isTyping: userTyping }) => {
      if (typingUserId === targetUserId) {
        setIsTyping(userTyping);
      }
    });

    // Listen for recipient's online status
    socket.on("recipientOnline", ({ userId: onlineUserId }) => {
      if (onlineUserId === targetUserId) {
        setIsRecipientOnline(true);
        setLastSeen(new Date());
      }
    });

    socket.on("recipientOffline", ({ userId: offlineUserId, lastSeen: userLastSeen }) => {
      if (offlineUserId === targetUserId) {
        setIsRecipientOnline(false);
        if (userLastSeen) {
          setLastSeen(userLastSeen);
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [userId, targetUserId]);

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    if (socketRef.current) {
      // Emit the sendMessage event
      socketRef.current.emit("sendMessage", {
        firstName: user.firstName,
        lastName: user.lastName,
        userId,
        targetUserId,
        message: newMessage,
      });

      // Clear typing status
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      socketRef.current.emit("userTyping", { userId, targetUserId, isTyping: false });

      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-lg overflow-hidden h-[80vh]">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={targetUserPhoto || "/api/placeholder/80/80"}
                alt={targetUserName || "User Profile"}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              {isRecipientOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-lg">{targetUserName || "Recipient Name"}</h2>
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-sm text-gray-200">
                {isRecipientOnline 
                  ? "Active now" 
                  : lastSeen 
                    ? `Last seen ${formatLastSeen(lastSeen)}` 
                    : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
              <Phone className="text-white" size={20} />
            </button>
            <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
              <Video className="text-white" size={20} />
            </button>
            <button className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition">
              <MoreVertical className="text-white" size={20} />
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="h-[65%] overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.senderId === userId ? "items-end" : "items-start"}`}>
              <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                msg.senderId === userId 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                  : "bg-white text-gray-800 border border-gray-200"
              }`}>
                <div>{msg.message}</div>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1 space-x-1">
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {msg.senderId === userId && (
                  <span>
                    {msg.isRead ? (
                      <CheckCheck className="w-3 h-3 text-blue-500" />
                    ) : (
                      <Check className="w-3 h-3 text-gray-400" />
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start">
              <div className="max-w-[75%] p-2 rounded-lg shadow-sm bg-gray-100 text-gray-800 border border-gray-200">
                <div className="flex space-x-1 px-2 py-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "200ms" }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "400ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 border-t flex items-center space-x-4 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-grow px-4 py-3 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-purple-600 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;