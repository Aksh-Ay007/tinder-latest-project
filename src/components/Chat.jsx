import React, { useEffect, useState, useRef } from "react";
import { Phone, Video, Send, Image, FileVideo, X, Smile, MoreVertical, Check, CheckCheck } from "lucide-react";
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
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadTimeoutRef = useRef(null);
  const autoCloseTimeoutRef = useRef(null);

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
        const { _id, senderId, message, mediaUrl, mediaType, timestamp, isRead } = msg;
        return {
          _id,
          message,
          mediaUrl,
          mediaType,
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          senderId: senderId?._id,
          timestamp,
          isRead,
        };
      });
      setMessages(chatMessages || []);

      // Mark received messages as read
      const unreadMessageIds = chatMessages
        ? chatMessages
            .filter(msg => msg.senderId === targetUserId && !msg.isRead)
            .map(msg => msg._id)
        : [];
      
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

  // Validate file size and type
  const validateFile = (file) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: "File is too large. Maximum 10MB allowed." };
    }
    
    // Determine and validate media type
    const fileType = file.type.startsWith('image/') ? 'image' : 
                     file.type.startsWith('video/') ? 'video' : null;
    
    if (!fileType) {
      return { valid: false, error: "Unsupported file type. Please select an image or video." };
    }
    
    return { valid: true, fileType };
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }
    
    setSelectedMedia(file);
    setSelectedMediaType(validation.fileType);
    setUploadError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target.result);
      setShowMediaUpload(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle media upload cancel
  const handleCancelUpload = () => {
    // First close the dialog
    setShowMediaUpload(false);
    
    // Clear any existing auto-close timeout
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
    
    // Then reset all the states
    setSelectedMedia(null);
    setSelectedMediaType(null);
    setMediaPreview(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(false);
    
    // Clear any existing upload timeout
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current);
      uploadTimeoutRef.current = null;
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload media via REST API (fallback method)
  const uploadViaAPI = async () => {
    try {
      setUploadProgress(25); // Show some progress

      const response = await axios.post(
        `${BASE_URL}/chat/media/${targetUserId}`,
        {
          mediaData: mediaPreview,
          mediaType: selectedMediaType,
          message: ""
        },
        { 
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 75) / progressEvent.total) + 25;
            setUploadProgress(percentCompleted > 100 ? 100 : percentCompleted);
          }
        }
      );
      
      setUploadProgress(100);
      
      if (response.data.success) {
        // Add the message to the local state
        const { _id, message, mediaUrl, mediaType, timestamp } = response.data.data;
        
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            _id,
            message,
            mediaUrl,
            mediaType,
            firstName: user.firstName,
            lastName: user.lastName,
            senderId: userId,
            timestamp,
            isRead: false,
          },
        ]);
        
        // Clean up after sending
        handleCancelUpload();
      } else {
        setUploadError("Failed to upload media");
      }
    } catch (error) {
      console.error("API upload error:", error);
      setUploadError(error.response?.data?.message || "Failed to upload media");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Close the dialog regardless of success or failure
      setShowMediaUpload(false);
    }
  };

  // Handle sending media with socket + API fallback
  const handleSendMedia = () => {
    if (!selectedMedia || !mediaPreview || !selectedMediaType) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(10); // Show initial progress
    
    // Set a timeout to automatically close the dialog after 10 seconds
    autoCloseTimeoutRef.current = setTimeout(() => {
      if (isUploading) {
        console.log("Auto-closing media upload dialog after timeout");
        setShowMediaUpload(false);
      }
    }, 10000);
    
    // Try socket first (faster)
    if (socketRef.current) {
      console.log("Emitting sendMediaMessage via socket");
      // Emit the sendMediaMessage event
      socketRef.current.emit("sendMediaMessage", {
        firstName: user.firstName,
        lastName: user.lastName,
        userId,
        targetUserId,
        mediaData: mediaPreview,
        mediaType: selectedMediaType,
      });
      
      // Setup a timeout for socket method (fallback to API if socket fails)
      uploadTimeoutRef.current = setTimeout(() => {
        if (isUploading) {
          console.log("Socket upload timeout or failed, trying API fallback");
          uploadViaAPI();
        }
      }, 8000); // Wait 8 seconds before trying API
    } else {
      // No socket available, use API directly
      console.log("No socket available, using API directly");
      uploadViaAPI();
    }
  };

  useEffect(() => {
    if (userId && targetUserId) {
      fetchChat();
    }
    
    // Setup periodic ping to keep track of online status
    const pingInterval = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.emit("ping", { userId });
      }
    }, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(pingInterval);
      // Clear any existing timeouts
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
    };
  }, [userId, targetUserId]);

  useEffect(() => {
    if (!userId || !targetUserId) return;

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

    // Listen for incoming text messages
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

    // Listen for incoming media messages
    socket.on("receiveMediaMessage", ({ _id, message, mediaUrl, mediaType, firstName, lastName, timestamp, isRead, senderId }) => {
      console.log("Received media message:", mediaUrl);
      setMessages((prevMessages) => [
        ...prevMessages,
        { _id, message, mediaUrl, mediaType, firstName, lastName, senderId, timestamp, isRead },
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

    // Listen for media upload success
    socket.on("mediaUploadSuccess", () => {
      console.log("Media upload success");
      
      // Clear the timeout to prevent API fallback
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
        uploadTimeoutRef.current = null;
      }
      
      // Clear the auto-close timeout
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = null;
      }
      
      // Immediately close the upload dialog
      setShowMediaUpload(false);
      setIsUploading(false);
      setUploadProgress(100);
      
      // Clean up the UI after a brief delay
      setTimeout(() => {
        setSelectedMedia(null);
        setSelectedMediaType(null);
        setMediaPreview(null);
        setUploadError(null);
        setUploadProgress(0);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 100);
    });

    // Listen for media upload errors
    socket.on("mediaUploadError", ({ error }) => {
      console.log("Socket media upload error:", error);
      
      // If we got an error but socket didn't time out yet, try the API
      if (isUploading) {
        uploadViaAPI();
      } else {
        setUploadError(error);
        setIsUploading(false);
        setUploadProgress(0);
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
      
      // Clear any existing timeouts
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
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

  // Render media content
  const renderMedia = (msg) => {
    if (!msg.mediaUrl) return null;
    
    if (msg.mediaType === 'image') {
      return (
        <img 
          src={msg.mediaUrl} 
          alt="Shared image"
          className="max-w-full rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition"
          onClick={() => window.open(msg.mediaUrl, '_blank')}
        />
      );
    } else if (msg.mediaType === 'video') {
      return (
        <video
          src={msg.mediaUrl}
          controls
          className="max-w-full rounded-lg shadow-sm"
          preload="metadata"
        />
      );
    }
    
    return null;
  };

  // Trigger file input click
  const triggerFileInput = (type) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
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
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="mb-4 p-4 bg-gray-100 rounded-full">
                <Image size={40} className="text-purple-500" />
              </div>
              <p className="text-center">No messages yet. Start chatting!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.senderId === userId ? "items-end" : "items-start"}`}>
                <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                  msg.senderId === userId 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                    : "bg-white text-gray-800 border border-gray-200"
                }`}>
                  {msg.mediaUrl ? (
                    <div className="mb-2">
                      {renderMedia(msg)}
                    </div>
                  ) : null}
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
            ))
          )}
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

        {/* Media Upload Preview */}
        {showMediaUpload && (
          <div className="absolute bottom-20 left-0 right-0 mx-auto w-full max-w-lg bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-800">Send {selectedMediaType === 'image' ? 'Photo' : 'Video'}</h3>
              <button 
                onClick={handleCancelUpload}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
              >
                <X size={20} />
              </button>
            </div>
            
            {uploadError && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">
                {uploadError}
              </div>
            )}
            
            <div className="flex justify-center mb-3">
              {selectedMediaType === 'image' ? (
                <img 
                  src={mediaPreview} 
                  alt="Upload preview" 
                  className="max-h-64 rounded"
                />
              ) : (
                <video 
                  src={mediaPreview} 
                  controls 
                  className="max-h-64 rounded"
                />
              )}
            </div>
            
            {isUploading && (
              <div className="mb-3">
                <div className="h-2 w-full bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-right mt-1">
                  {uploadProgress}%
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleSendMedia}
                disabled={isUploading}
                className={`bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-purple-600 transition ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUploading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Message Input Area */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 border-t flex items-center space-x-2 relative">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*"
          />
          
          {/* Media buttons */}
          <button 
            onClick={() => triggerFileInput('image')}
            className="text-pink-500 hover:text-pink-700 p-2 rounded-full hover:bg-gray-100 transition"
            disabled={isUploading}
          >
            <Image size={20} />
          </button>
          <button 
            onClick={() => triggerFileInput('video')}
            className="text-purple-500 hover:text-purple-700 p-2 rounded-full hover:bg-gray-100 transition"
            disabled={isUploading}
          >
            <FileVideo size={20} />
          </button>
          
          {/* Text input */}
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
            disabled={isUploading}
          />
          
          {/* Send button */}
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-full hover:from-pink-600 hover:to-purple-600 transition"
            disabled={isUploading || !newMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;