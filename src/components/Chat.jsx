import React, { useEffect, useState, useRef } from "react";
import { Phone, Video, Send, Smile, MoreVertical } from "lucide-react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import EmojiPicker from "emoji-picker-react"; // Import the emoji picker

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUserName, setTargetUserName] = useState("");
  const [targetUserPhoto, setTargetUserPhoto] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to toggle emoji picker
  const emojiPickerRef = useRef(null); // Ref for emoji picker

  const user = useSelector((store) => store.user);
  const userId = user?._id;

  // Fetch chat and recipient details
  const fetchChat = async () => {
    try {
      const chat = await axios.get(`${BASE_URL}/chat/${targetUserId}`, { withCredentials: true });

      // Extract recipient details
      const recipient = chat.data.participant.find((p) => p._id !== userId);
      setTargetUserName(`${recipient.firstName} ${recipient.lastName}`);
      setTargetUserPhoto(recipient.photoUrl);

      // Map messages
      const chatMessages = chat?.data?.messages.map((msg) => {
        const { senderId, message, timestamp, isRead } = msg;
        return {
          message,
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          timestamp,
          isRead,
        };
      });
      setMessages(chatMessages);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [targetUserId]);

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();

    // Join the chat room
    socket.emit("JoinChat", { firstName: user.firstName, userId, targetUserId });

    // Listen for incoming messages
    socket.on("receiveMessage", ({ message, firstName, lastName, timestamp, isRead }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message, firstName, lastName, timestamp, isRead },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, targetUserId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const socket = createSocketConnection();

    // Emit the sendMessage event
    socket.emit("sendMessage", {
      firstName: user.firstName,
      lastName: user.lastName,
      userId,
      targetUserId,
      message: newMessage,
    });

    setNewMessage("");
    setShowEmojiPicker(false); // Close emoji picker when sending a message
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji); // Append the emoji to the message
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-semibold text-lg">{targetUserName || "Recipient Name"}</h2>
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-sm text-gray-200">Active now</p>
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
            <div key={index} className={`flex flex-col ${msg.firstName === user.firstName ? "items-end" : "items-start"}`}>
              <div className="max-w-[75%] p-3 rounded-lg shadow-sm bg-white text-gray-800 border border-gray-200">
                <strong>{`${msg.firstName} `}: </strong>
                {msg.message}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {msg.isRead ? " • Seen" : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Message Input Area */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 border-t flex items-center space-x-4 relative">
          <button
            className="text-purple-500 hover:text-purple-700 transition"
            onClick={() => setShowEmojiPicker((prev) => !prev)} // Toggle emoji picker
          >
            <Smile size={24} />
          </button>
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
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