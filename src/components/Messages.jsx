import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addConnections } from '../utils/connectionSlice';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${BASE_URL}/all`, { withCredentials: true });
      setConversations(res.data.data);
      
      // Also update the connections in the Redux store
      const connectionsRes = await axios.get(`${BASE_URL}/user/connetions`, { withCredentials: true });
      dispatch(addConnections(connectionsRes.data.data));
      
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError("Failed to load your conversations. Please try again later.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Format timestamp to readable time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week - show day name
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older - show date
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Truncate message text
  const truncateMessage = (message, maxLength = 40) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-xl border border-red-100">
          <div className="mb-4 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">{error}</h2>
          <button 
            onClick={fetchConversations}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center p-10 max-w-md bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-6 text-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Messages Yet</h1>
          <p className="text-gray-600 mb-8">Start chatting with your connections to see messages here.</p>
          <Link to={'/'} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg">
            Find People to Chat With
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-purple-100 mt-1">Your conversations</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => {
              // Extract data properly based on backend structure
              const { _id, participant, lastMessage, unreadCount } = conversation;
              
              if (!participant || participant.length === 0) return null;
              
              // Find the other person in the conversation
              const otherPerson = participant.find(p => p._id !== user._id);
              
              if (!otherPerson) return null;
              
              const { _id: personId, firstName, lastName, photoUrl } = otherPerson;
              
              // Check if we have a last message
              const hasMessage = lastMessage && (lastMessage.message || lastMessage.mediaUrl);
              const hasUnread = unreadCount > 0;
              
              // Create message preview
              let messagePreview = 'No messages yet';
              if (hasMessage) {
                messagePreview = lastMessage.mediaUrl 
                  ? (lastMessage.mediaType === 'image' ? '📷 Photo' : '📹 Video')
                  : truncateMessage(lastMessage.message || '');
              }
              
              return (
                <Link to={`/chat/${personId}`} key={_id}>
                  <div className="p-4 hover:bg-gray-50 transition duration-200">
                    <div className="flex items-center space-x-4">
                      {/* User Avatar */}
                      <div className="relative">
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-purple-100"
                            alt={`${firstName}'s profile`} 
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold border-2 border-purple-100">
                            {firstName?.charAt(0)}{lastName?.charAt(0)}
                          </div>
                        )}
                        
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>
                      
                      {/* Message Preview */}
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={`text-lg ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                            {firstName} {lastName}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {hasMessage ? formatMessageTime(lastMessage.timestamp) : ''}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${hasUnread ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                          {messagePreview}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;